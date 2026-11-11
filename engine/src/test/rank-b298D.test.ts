/**
 * Batch B298, group D: cards whose blocked records were re-read. Each test is
 * on the clause the record said the engine couldn't run (or, for a card never
 * triaged, the clause most likely to be wrong).
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  keywords,
  lands,
  life,
  named,
  pickTargets,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === card);
/** Cast `card` from where it is, under whatever permission offers it. */
const castOffered = (game: Game, card: ObjectId): void => {
  const offer = game.legalActions(A).find((o) => o.kind === "cast-spell" && o.card === card) as
    | Record<string, unknown>
    | undefined;
  if (offer === undefined) throw new Error("not offered");
  const extra = Object.fromEntries(
    ["via", "graveyardGrant", "face", "free"].filter((k) => offer[k] !== undefined).map((k) => [k, offer[k]]),
  );
  game.dispatch({ type: "cast-spell", player: A, card, targets: [], ...extra } as Action);
  settle(game);
};
const playable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((o) => (o.kind === "play-land" || o.kind === "cast-spell") && o.card === card);

describe("Anje, Maid of Dishonor", () => {
  it("makes one Blood for Anje and another Vampire entering, and only once each turn", () => {
    const { game } = table();
    enter(game, "Anje, Maid of Dishonor");
    expect(tokensNamed(game, "Blood Token")).toBe(1);
    enter(game, "Vampire Nighthawk");
    expect(tokensNamed(game, "Blood Token")).toBe(1);
  });

  it("doesn't trigger for a non-Vampire", () => {
    const { game } = table();
    spawn(game, "Anje, Maid of Dishonor");
    enter(game, "Grizzly Bears");
    expect(tokensNamed(game, "Blood Token")).toBe(0);
    enter(game, "Vampire Nighthawk");
    expect(tokensNamed(game, "Blood Token")).toBe(1);
  });
});

describe("Necklace of Girion", () => {
  it("puts a counter on a creature for a green spell and for a Forest entering", () => {
    const { game, a } = table();
    spawn(game, "Necklace of Girion");
    const target = spawn(game, "Grizzly Bears");
    pickTargets(a, target);
    enter(game, "Forest");
    expect(counters(game, target)).toBe(1);
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(counters(game, target)).toBe(2);
  });
});

describe("Aang and Katara", () => {
  it("counts tapped artifacts and creatures you control", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears", A, { tapped: true });
    spawn(game, "Ornithopter", A, { tapped: true });
    spawn(game, "Sol Ring", A, { tapped: true });
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B, { tapped: true });
    enter(game, "Aang and Katara");
    expect(tokensNamed(game, "Ally Token")).toBe(3);
  });
});

describe("Compy Swarm", () => {
  it("makes a tapped copy of itself at your end step if a creature died", () => {
    const { game } = table();
    spawn(game, "Compy Swarm");
    const bears = spawn(game, "Grizzly Bears", B);
    destroy(game, bears);
    toStep(game, "end");
    settle(game);
    const swarms = named(game, "Compy Swarm");
    expect(swarms).toHaveLength(2);
    expect(swarms.filter((id) => game.state.objects[id].tapped)).toHaveLength(1);
    // No creature died on the next turn: no copy then.
    toStep(game, "end");
    settle(game);
    expect(named(game, "Compy Swarm")).toHaveLength(2);
  });
});

describe("Role Reversal", () => {
  it("exchanges two permanents sharing a permanent type, and refuses two that share none", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    const mine = spawn(game, "Ornithopter");
    const theirs = spawn(game, "Sol Ring", B);
    const theirLand = spawn(game, "Forest", B);
    const spell = toHand(game, "Role Reversal");
    expect(() => cast(game, spell, { targets: [ref(mine), ref(theirLand)] })).toThrow();
    cast(game, spell, { targets: [ref(mine), ref(theirs)] });
    expect(game.state.objects[mine].controller).toBe(B);
    expect(game.state.objects[theirs].controller).toBe(A);
  });
});

describe("Reidane, God of the Worthy", () => {
  it("makes an opponent's snow land enter tapped, not a basic one", () => {
    const { game } = table();
    spawn(game, "Reidane, God of the Worthy");
    const snow = enter(game, "Snow-Covered Forest", B);
    const plain = enter(game, "Forest", B);
    const mine = enter(game, "Snow-Covered Forest", A);
    expect(game.state.objects[snow].tapped).toBe(true);
    expect(game.state.objects[plain].tapped).toBe(false);
    expect(game.state.objects[mine].tapped).toBe(false);
  });
});

describe("Valkmira, Protector's Shield", () => {
  it("prevents 1 of a source an opponent controls' damage to a permanent you control", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const card = toHand(game, "Reidane, God of the Worthy");
    cast(game, card, { face: 1 } as never);
    expect(game.state.objects[card].face).toBe(1);
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(giant)], { source: theirs });
    settle(game);
    expect(game.state.objects[giant].damageMarked).toBe(1);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(A)], { source: theirs });
    settle(game);
    expect(life(game, A)).toBe(19);
    const mine = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "damage", amount: 2, target: 0 }, [ref(A)], { source: mine });
    settle(game);
    expect(life(game, A)).toBe(17);
  });
});

describe("Revival // Revenge", () => {
  it("Revenge doubles your life and the opponent loses half theirs, rounded up", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    lands(game, "Swamp", 3);
    game.state.players[A].life = 7;
    game.state.players[B].life = 15;
    const card = toHand(game, "Revival // Revenge");
    cast(game, card, { targets: [ref(B)], face: 2 } as never);
    expect(life(game, A)).toBe(14);
    expect(life(game, B)).toBe(7);
  });

  it("Revival returns a creature card with mana value 3 or less", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const card = toHand(game, "Revival // Revenge");
    expect(() => cast(game, card, { targets: [ref(giant)], face: 1 } as never)).toThrow();
    cast(game, card, { targets: [ref(bears)], face: 1 } as never);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Blitzwing, Cruel Tormentor", () => {
  it("drains the life the opponent lost this turn, and converts when none is lost", () => {
    const { game, a } = table();
    const blitz = spawn(game, "Blitzwing, Cruel Tormentor");
    game.debugApplyEffect(A, { kind: "lose-life", amount: 3, target: 0 }, [ref(B)]);
    pickTargets(a, B);
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(14);
    expect(game.state.objects[blitz].face ?? 0).toBe(0);
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(14);
    expect(game.state.objects[blitz].face).toBe(1);
    expect(subtypes(game, blitz)).toContain("Vehicle");
  });
});

describe("Ayara, Widow of the Realm", () => {
  it("deals the sacrificed permanent's mana value to an opponent and gains that much", () => {
    const { game } = table();
    const ayara = spawn(game, "Ayara, Widow of the Realm");
    const giant = spawn(game, "Hill Giant");
    activate(game, ayara, 0, { targets: [ref(B)], sacrifice: giant });
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(24);
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Circuits Act", () => {
  it("makes one Clown Robot per different result of three dice", () => {
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const { game } = table({ seed });
      lands(game, "Mountain", 3);
      cast(game, toHand(game, "Circuits Act"));
      const rolls = (game.state.journal?.entries ?? []).filter((e) => (e as { kind: string }).kind === "rolled");
      const made = tokensNamed(game, "Clown Robot Token");
      expect(made).toBeGreaterThanOrEqual(1);
      expect(made).toBeLessThanOrEqual(3);
      expect(rolls.length).toBeGreaterThan(0);
    }
  });
});

describe("Tersa Lightshatter", () => {
  it("exiles a random graveyard card as it attacks, which may be played this turn (a land too)", () => {
    const { game, a } = table();
    const tersa = spawn(game, "Tersa Lightshatter");
    const cards = Array.from({ length: 7 }, () => toGraveyard(game, "Wastes"));
    attack(game, a, [tersa]);
    const exiled = cards.filter((id) => zone(game, id) === "exile");
    expect(exiled).toHaveLength(1);
    expect(graveyard(game)).toHaveLength(6);
    expect(playable(game, exiled[0])).toBe(true);
  });

  it("doesn't trigger with six cards in the graveyard", () => {
    const { game, a } = table();
    const tersa = spawn(game, "Tersa Lightshatter");
    Array.from({ length: 6 }, () => toGraveyard(game, "Wastes"));
    attack(game, a, [tersa]);
    expect(graveyard(game)).toHaveLength(6);
  });
});

describe("The Cauldron of Eternity", () => {
  it("costs {2} less for each creature card in your graveyard", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    for (let i = 0; i < 4; i += 1) toGraveyard(game, "Grizzly Bears");
    const cauldron = toHand(game, "The Cauldron of Eternity");
    expect(castable(game, cauldron)).toBe(false);
    toGraveyard(game, "Grizzly Bears");
    expect(castable(game, cauldron)).toBe(true);
  });

  it("puts a creature you control that dies on the bottom of its owner's library", () => {
    const { game } = table();
    spawn(game, "The Cauldron of Eternity");
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, bears);
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(bears);
  });
});

describe("Summon: Brynhildr", () => {
  it("chapter I's card is playable this turn; chapter II gives the next creature spell haste", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    const top = toLibrary(game, "Lightning Bolt");
    lands(game, "Mountain", 1);
    enter(game, "Summon: Brynhildr");
    expect(zone(game, top)).toBe("exile");
    expect(playable(game, top)).toBe(true);
    toStep(game, "precombat-main");
    settle(game);
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});

describe("Dead Man's Chest", () => {
  it("exiles its power from its owner's library, castable with mana of any type", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    lands(game, "Swamp", 4);
    const giant = spawn(game, "Hill Giant", B);
    const chest = toHand(game, "Dead Man's Chest");
    cast(game, chest, { targets: [ref(giant)] });
    const before = game.state.zones.perPlayer[B].library.length;
    destroy(game, giant, A);
    expect(game.state.zones.perPlayer[B].library.length).toBe(before - 3);
    const exiled = Object.values(game.state.objects).filter(
      (o) => o.zone === "exile" && o.owner === B && o.cardName === "Grizzly Bears",
    );
    expect(exiled).toHaveLength(3);
    expect(castable(game, exiled[0].id)).toBe(true);
  });
});

describe("Chandra, Dressed to Kill", () => {
  it("+1: a red card exiled may be cast this turn; a nonred one may not", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const chandra = spawn(game, "Chandra, Dressed to Kill");
    const bolt = toLibrary(game, "Lightning Bolt");
    activate(game, chandra, 1);
    expect(zone(game, bolt)).toBe("exile");
    expect(castable(game, bolt)).toBe(true);
  });

  it("+1: a nonred card stays exiled, not castable", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const chandra = spawn(game, "Chandra, Dressed to Kill");
    const growth = toLibrary(game, "Giant Growth");
    const index = game.registry.get("Chandra, Dressed to Kill").activated.findIndex((x) => x.text.startsWith("+1: Exile"));
    activate(game, chandra, index);
    expect(zone(game, growth)).toBe("exile");
    expect(castable(game, growth)).toBe(false);
  });
});

describe("Fire Lord Sozin", () => {
  it("pays {X} to return creature cards with total mana value X or less from that player's graveyard", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const sozin = spawn(game, "The Rise of Sozin");
    game.state.objects[sozin].counters.lore = 2;
    // Chapter III: exiled and returned transformed (the same object id here).
    toStep(game, "precombat-main");
    settle(game);
    expect(game.state.objects[sozin].face).toBe(1);
    expect(zone(game, sozin)).toBe("battlefield");
    game.state.objects[sozin].summoningSick = false;
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const giant = toGraveyard(game, "Hill Giant", B);
    let offered: readonly string[] = [];
    a.chooseTargetsFn = (_view, offer) => {
      const o = offer as unknown as { targetOptions?: readonly (readonly { object?: string }[])[] };
      offered = (o.targetOptions?.[0] ?? []).map((t) => t.object ?? "");
      return [ref(bears)];
    };
    a.declareAttackersFn = () => [{ attacker: sozin, defender: B }];
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 2 } as Action);
    toStep(game, "postcombat-main");
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
    expect(zone(game, giant)).toBe("graveyard");
    expect(offered).not.toContain(giant);
  });
});

describe("Commander Liara Portyr", () => {
  it("exiles X cards and spells cast from exile cost X less this turn", () => {
    const { game, a } = table({ players: 3, deck: "Hill Giant" });
    const liara = spawn(game, "Commander Liara Portyr");
    const other = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    a.declareAttackersFn = () => [
      { attacker: liara, defender: B },
      { attacker: other, defender: "carol" as never },
    ];
    toStep(game, "postcombat-main");
    const exiled = Object.values(game.state.objects).filter(
      (o) => o.zone === "exile" && o.owner === A && o.cardName === "Hill Giant",
    );
    expect(exiled).toHaveLength(2);
    // Hill Giant is {3}{R}: two Mountains pay it only with {2} off.
    expect(castable(game, exiled[0].id)).toBe(true);
    castOffered(game, exiled[0].id);
    expect(zone(game, exiled[0].id)).toBe("battlefield");
    // The second one, from exile too, also costs {2} less: with the first two
    // Mountains tapped, two more pay its {1}{R}.
    expect(castable(game, exiled[1].id)).toBe(false);
    lands(game, "Mountain", 2);
    expect(castable(game, exiled[1].id)).toBe(true);
  });
});
