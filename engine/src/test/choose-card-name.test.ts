import { describe, expect, it } from "vitest";
import { nameableCardNames } from "../card-names.js";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  attack,
  cast,
  graveyard,
  hand,
  lands,
  nextTurn,
  registryOf,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

/** The pending card-name offer for `player`, if one is up. */
function nameOffer(game: Game, player = A): Extract<LegalAction, { kind: "choose-card-name" }> | undefined {
  return game
    .legalActions(player)
    .find((a): a is Extract<LegalAction, { kind: "choose-card-name" }> => a.kind === "choose-card-name");
}

/** Cast `name` from alice's hand off fresh Wastes, naming `named`. */
function castNaming(game: Game, a: ReturnType<typeof table>["a"], name: string, named: string, mana = 7): ObjectId {
  lands(game, "Wastes", mana);
  lands(game, "Plains", 1);
  lands(game, "Island", 1);
  a.chooseCardNameFn = () => named;
  const card = toHand(game, name);
  cast(game, card);
  return card;
}

const canActivate = (game: Game, source: ObjectId, index: number, player = B): boolean =>
  game.canDispatch({ type: "activate-ability", player, source, abilityIndex: index, targets: [] }) === null;

const canCast = (game: Game, card: ObjectId, player = B): boolean =>
  game.legalActions(player).some((a) => a.kind === "cast-spell" && a.card === card);

describe("choose a card name (rule 201.4)", () => {
  it("offers every card name, not a token's or a split card's whole, and a filter narrows it", () => {
    const { game } = table();
    const all = nameableCardNames(registryOf(game));
    expect(all).toContain("Lightning Bolt");
    expect(all).toContain("Fire");
    expect(all).toContain("Ice");
    expect(all).not.toContain("Fire // Ice");
    expect(all.some((n) => n.endsWith(" Token") || n.includes("Token ("))).toBe(false);
    const nonland = nameableCardNames(registryOf(game), { notTypes: ["land"] });
    expect(nonland).not.toContain("Forest");
    expect(nonland).toContain("Lightning Bolt");
  });

  it("asks as Pithing Needle enters, suggesting the opponent's permanents with abilities first", () => {
    const { game } = table();
    spawn(game, "Prodigal Sorcerer", B);
    lands(game, "Wastes", 1);
    const needle = toHand(game, "Pithing Needle");
    cast(game, needle, { settle: false });
    game.advanceUntil((s) => s.awaiting !== null);
    expect(game.state.awaiting?.kind).toBe("choose-card-name");
    const offer = nameOffer(game);
    expect(offer?.suggested[0]).toBe("Prodigal Sorcerer");
    expect(offer?.options.length).toBeGreaterThan(1000);
    // A name the catalogue doesn't have is refused.
    expect(game.canDispatch({ type: "choose-card-name", player: A, name: "Not A Card" })).not.toBeNull();
    game.dispatch({ type: "choose-card-name", player: A, name: "Prodigal Sorcerer" });
    settle(game);
    expect(zone(game, needle)).toBe("battlefield");
    expect(game.state.objects[needle].chosenNames).toEqual(["Prodigal Sorcerer"]);
  });

  it("Pithing Needle stops a named source's abilities in any zone, mana abilities aside", () => {
    const { game, a } = table();
    const stones = [spawn(game, "Mind Stone", B), spawn(game, "Mind Stone", B)];
    const dragon = toHand(game, "Eternal Dragon", B);
    const flute = toHand(game, "Disruptor Flute", B);
    castNaming(game, a, "Pithing Needle", "Mind Stone");
    game.state.priority.holder = B;
    // {1}, {T}, sacrifice: draw — stopped; {T}: Add {C} still pays for a
    // flash {2}.
    expect(canActivate(game, stones[0], 1)).toBe(false);
    expect(canCast(game, flute)).toBe(true);
    // A Needle on Eternal Dragon stops its plainscycling from the hand.
    game.state.priority.holder = A;
    castNaming(game, a, "Pithing Needle", "Eternal Dragon", 1);
    game.state.priority.holder = B;
    expect(game.canDispatch({ type: "cycle", player: B, card: dragon })).not.toBeNull();
  });

  it("Phyrexian Revoker stops mana abilities too, and only nonland names are offered", () => {
    const { game, a } = table();
    const stone = spawn(game, "Mind Stone", B);
    lands(game, "Wastes", 2);
    a.chooseCardNameFn = (_view, _source, options) => {
      expect(options).not.toContain("Forest");
      return "Mind Stone";
    };
    spawn(game, "Mind Stone", B);
    const flute = toHand(game, "Disruptor Flute", B);
    cast(game, toHand(game, "Phyrexian Revoker"));
    game.state.priority.holder = B;
    expect(canActivate(game, stone, 0)).toBe(false);
    expect(canCast(game, flute)).toBe(false);
  });

  it("the choice ends with the permanent: a Needle that leaves frees the name", () => {
    const { game, a } = table();
    const stone = spawn(game, "Mind Stone", B);
    const needle = castNaming(game, a, "Pithing Needle", "Mind Stone");
    expect(canActivate(game, stone, 1)).toBe(false);
    game.debugMove(needle, "graveyard");
    expect(game.state.objects[needle].chosenNames).toBeUndefined();
    lands(game, "Wastes", 1, B);
    game.state.priority.holder = B;
    expect(canActivate(game, stone, 1)).toBe(true);
  });

  it("Meddling Mage names one half of a split card: that half can't be cast, the other can", () => {
    const { game, a } = table();
    castNaming(game, a, "Meddling Mage", "Fire");
    lands(game, "Wastes", 2, B);
    lands(game, "Island", 1, B);
    lands(game, "Mountain", 1, B);
    const card = toHand(game, "Fire // Ice", B);
    game.state.priority.holder = B;
    const offers = game.legalActions(B).filter((x) => x.kind === "cast-spell" && x.card === card);
    const faces = offers.flatMap((o) => (o.kind === "cast-spell" ? [o.face] : []));
    expect(faces).not.toContain(1);
    expect(faces).toContain(2);
  });

  it("Sorcerous Spyglass looks at the chosen opponent's hand, seen by its chooser alone", () => {
    const { game, a } = table({ players: 3 });
    const bolt = toHand(game, "Lightning Bolt", C);
    lands(game, "Wastes", 2);
    const glass = toHand(game, "Sorcerous Spyglass");
    cast(game, glass, { settle: false });
    game.advanceUntil((s) => s.awaiting !== null);
    // Two opponents: which one first.
    expect(game.state.awaiting?.kind).toBe("choose-creature-type");
    game.dispatch({ type: "choose-creature-type", player: A, creatureType: C });
    expect(game.state.awaiting?.kind).toBe("choose-card-name");
    expect(nameOffer(game)?.looked).toContain(bolt);
    expect(nameOffer(game)?.looked).toEqual(hand(game, C));
    expect(nameOffer(game)?.suggested).toContain("Lightning Bolt");
    expect(game.viewFor(A).objects[bolt]).toBeDefined();
    expect(game.viewFor(B).objects[bolt]?.cardName ?? null).toBeNull();
    a.chooseCardNameFn = () => "Lightning Bolt";
    game.dispatch({ type: "choose-card-name", player: A, name: "Lightning Bolt" });
    settle(game);
    expect(game.state.objects[glass].chosenNames).toEqual(["Lightning Bolt"]);
  });

  it("Alhammarret offers only the nonland names its opponents revealed, and none without one", () => {
    const { game } = table();
    toHand(game, "Lightning Bolt", B);
    toHand(game, "Forest", B);
    lands(game, "Wastes", 5);
    lands(game, "Island", 2);
    const sphinx = toHand(game, "Alhammarret, High Arbiter");
    cast(game, sphinx, { settle: false });
    game.advanceUntil((s) => s.awaiting !== null);
    expect(nameOffer(game)?.options).toEqual(["Lightning Bolt"]);
    game.dispatch({ type: "choose-card-name", player: A, name: "Lightning Bolt" });
    settle(game);
    const bolt = toHand(game, "Lightning Bolt", B);
    lands(game, "Mountain", 1, B);
    game.state.priority.holder = B;
    expect(canCast(game, bolt)).toBe(false);

    const second = table();
    toHand(second.game, "Forest", B);
    lands(second.game, "Wastes", 5);
    lands(second.game, "Island", 2);
    const other = toHand(second.game, "Alhammarret, High Arbiter");
    cast(second.game, other);
    expect(zone(second.game, other)).toBe("battlefield");
    expect(second.game.state.objects[other].chosenNames).toBeUndefined();
  });

  it("Disruptor Flute taxes the named spell by {3}", () => {
    const { game, a } = table();
    castNaming(game, a, "Disruptor Flute", "Lightning Bolt");
    const bolt = toHand(game, "Lightning Bolt", B);
    lands(game, "Mountain", 1, B);
    lands(game, "Wastes", 2, B);
    game.state.priority.holder = B;
    expect(canCast(game, bolt)).toBe(false);
    lands(game, "Wastes", 1, B);
    expect(canCast(game, bolt)).toBe(true);
  });

  it("Skyseer's Chariot taxes the named source's abilities by {2}", () => {
    const { game, a } = table();
    const sorcerer = spawn(game, "Prodigal Sorcerer", B);
    castNaming(game, a, "Skyseer's Chariot", "Prodigal Sorcerer");
    game.state.priority.holder = B;
    const ping = { type: "activate-ability", player: B, source: sorcerer, abilityIndex: 0, targets: [{ kind: "player", player: A }] } as const;
    expect(game.canDispatch(ping)).not.toBeNull();
    lands(game, "Wastes", 2, B);
    expect(game.canDispatch(ping)).toBeNull();
  });

  it("Curse of Silence taxes only the enchanted player, and may be cashed in when they cast it", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Plains", 1);
    a.chooseCardNameFn = () => "Shock";
    const curse = toHand(game, "Curse of Silence");
    cast(game, curse, { targets: [{ kind: "player", player: B }] });
    expect(game.state.objects[curse].attachedToPlayer).toBe(B);
    const forB = toHand(game, "Shock", B);
    const forC = toHand(game, "Shock", C);
    lands(game, "Mountain", 1, B);
    lands(game, "Mountain", 1, C);
    game.state.priority.holder = C;
    expect(canCast(game, forC, C)).toBe(true);
    game.state.priority.holder = B;
    expect(canCast(game, forB, B)).toBe(false);
    lands(game, "Wastes", 2, B);
    expect(canCast(game, forB, B)).toBe(true);
    a.chooseModesFn = () => [0];
    const before = hand(game, A).length;
    cast(game, forB, { player: B, targets: [{ kind: "player", player: C }] });
    expect(zone(game, curse)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("Petrified Hamlet names a land as its trigger resolves, gives it {T}: Add {C}, and stops its other abilities", () => {
    const { game, a } = table();
    a.chooseCardNameFn = (_v, _s, options) => {
      expect(options).not.toContain("Lightning Bolt");
      return "Forest";
    };
    const hamlet = toHand(game, "Petrified Hamlet");
    game.dispatch({ type: "play-land", player: A, card: hamlet });
    settle(game);
    expect(game.state.objects[hamlet].chosenNames).toEqual(["Forest"]);
    const forest = spawn(game, "Forest", B);
    // Its own {T}: Add {G} (implied by its type) and the granted {T}: Add {C}.
    game.state.priority.holder = B;
    expect(game.canDispatch({ type: "activate-ability", player: B, source: forest, abilityIndex: 1, targets: [] })).toBeNull();
  });

  it("Conjurer's Ban stops the name being cast or played until its caster's next turn", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    a.chooseCardNameFn = () => "Forest";
    cast(game, toHand(game, "Conjurer's Ban"));
    const forest = toHand(game, "Forest");
    expect(game.canDispatch({ type: "play-land", player: A, card: forest })).not.toBeNull();
    nextTurn(game);
    nextTurn(game);
    expect(game.state.turn.activePlayerIndex).toBe(0);
    expect(game.canDispatch({ type: "play-land", player: A, card: forest })).toBeNull();
  });

  it("Cheering Fanatic's name costs {1} less for every player this turn", () => {
    const { game, a } = table();
    const fanatic = spawn(game, "Cheering Fanatic");
    a.chooseCardNameFn = () => "Divination";
    attack(game, a, [fanatic]);
    const div = toHand(game, "Divination", B);
    expect(game.viewFor(B).objects[div]?.effectiveManaCost).toBe("{1}{U}");
    const own = toHand(game, "Divination");
    expect(game.viewFor(A).objects[own]?.effectiveManaCost).toBe("{1}{U}");
  });

  it("Brain Pry discards the named card, and draws when there's none", () => {
    const { game, a } = table();
    const bolt = toHand(game, "Lightning Bolt", B);
    lands(game, "Swamp", 2);
    a.chooseCardNameFn = () => "Lightning Bolt";
    const before = hand(game, A).length;
    cast(game, toHand(game, "Brain Pry"), { targets: [{ kind: "player", player: B }] });
    expect(graveyard(game, B)).toContain(bolt);
    expect(hand(game, A).length).toBe(before);

    lands(game, "Swamp", 2);
    const again = hand(game, A).length;
    cast(game, toHand(game, "Brain Pry"), { targets: [{ kind: "player", player: B }] });
    expect(hand(game, A).length).toBe(again + 1);
  });
});
