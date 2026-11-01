/**
 * `create-token-copy` with a linked source: the card exiled with this (rule
 * 607.2a), an "until this leaves" exile's included (rule 610.3); the card
 * exiled as a cost; the cards exiled this way; each matching card in exile;
 * the creature enchanted; and a read amount of copies. A copy of a card reads
 * what was printed on it, and a copy of an instant or sorcery card is no token
 * (rule 111.5).
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  C,
  activate,
  cast,
  controller,
  counters,
  destroy,
  graveyard,
  keywords,
  lands,
  named,
  nextTurn,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  supertypes,
  table,
  toExile,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";
import type { Table } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const tokens = (game: Game): readonly ObjectId[] =>
  game.battlefield.filter((id) => game.state.objects[id].isToken === true);

/** The one token on the battlefield named `name`. */
const theToken = (game: Game, name: string): ObjectId => {
  const found = named(game, name).filter((id) => game.state.objects[id].isToken === true);
  expect(found).toHaveLength(1);
  return found[0];
};

const toTurn = (game: Game, turn: number): void =>
  game.advanceUntil((s) => s.turn.number === turn && s.turn.step === "postcombat-main");

/** Past the declared attack's trigger, resolved. */
const toAttackResolved = (game: Game): void => {
  game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.zones.shared.stack.length > 0);
  settle(game);
};

describe("a copy of a card exiled with this (Mimic Vat)", () => {
  /** A Vat with `name` imprinted on it, by its real trigger. */
  const imprinted = ({ game, a }: Table, name: string): { vat: ObjectId; card: ObjectId } => {
    const vat = spawn(game, "Mimic Vat", A);
    const card = spawn(game, name, B);
    a.chooseModesFn = () => [0];
    destroy(game, card);
    settle(game);
    return { vat, card };
  };

  it("imprints the card and returns each other one to its owner's graveyard", () => {
    const t = table();
    const { vat, card } = imprinted(t, "Grizzly Bears");
    expect(zone(t.game, card)).toBe("exile");
    expect(t.game.state.objects[card].exiledWith?.source).toBe(vat);

    const second = spawn(t.game, "Hill Giant", B);
    destroy(t.game, second);
    settle(t.game);
    expect(zone(t.game, second)).toBe("exile");
    expect(graveyard(t.game, B)).toContain(card);
  });

  it("declined, keeps the card it has", () => {
    const t = table();
    const { card } = imprinted(t, "Grizzly Bears");
    t.a.chooseModesFn = () => [];
    const second = spawn(t.game, "Hill Giant", B);
    destroy(t.game, second);
    settle(t.game);
    expect(zone(t.game, second)).toBe("graveyard");
    expect(zone(t.game, card)).toBe("exile");
  });

  it("makes a hasty copy under its controller, exiled at the next end step", () => {
    const t = table();
    const { vat } = imprinted(t, "Grizzly Bears");
    lands(t.game, "Wastes", 3);
    activate(t.game, vat);
    const token = theToken(t.game, "Grizzly Bears");
    expect(controller(t.game, token)).toBe(A);
    expect(keywords(t.game, token).has("haste")).toBe(true);
    toStep(t.game, "end");
    settle(t.game);
    expect(tokensNamed(t.game, "Grizzly Bears")).toBe(0);
  });

  it("makes nothing with nothing exiled", () => {
    const { game } = table();
    const vat = spawn(game, "Mimic Vat", A);
    lands(game, "Wastes", 3);
    activate(game, vat);
    expect(tokens(game)).toHaveLength(0);
  });

  it("asks which when two cards are exiled with it, and copies that one", () => {
    const t = table();
    const { vat, card } = imprinted(t, "Grizzly Bears");
    // A melded pair's ruling: two cards linked at once.
    const other = toExile(t.game, "Hill Giant", B);
    t.game.state.objects[other].exiledWith = t.game.state.objects[card].exiledWith;
    lands(t.game, "Wastes", 3);
    const seen = pickFromZone(t.a, other);
    activate(t.game, vat);
    expect(seen.offered).toEqual(expect.arrayContaining([card, other]));
    expect(tokensNamed(t.game, "Hill Giant")).toBe(1);
    expect(tokensNamed(t.game, "Grizzly Bears")).toBe(0);
    expect(zone(t.game, other)).toBe("exile");
    expect(keywords(t.game, theToken(t.game, "Hill Giant")).has("haste")).toBe(true);
  });

  it("makes no token of an instant or sorcery card (rule 111.5)", () => {
    const t = table();
    const { vat, card } = imprinted(t, "Grizzly Bears");
    const bolt = toExile(t.game, "Lightning Bolt", B);
    t.game.state.objects[bolt].exiledWith = t.game.state.objects[card].exiledWith;
    t.game.state.objects[card].exiledWith = undefined;
    lands(t.game, "Wastes", 3);
    activate(t.game, vat);
    expect(tokens(t.game)).toHaveLength(0);
  });

  it("reads the stint that exiled it: a Vat that came back has no card (rule 400.7)", () => {
    const t = table();
    const { vat } = imprinted(t, "Grizzly Bears");
    t.game.debugMove(vat, "exile");
    t.game.debugMove(vat, "battlefield");
    lands(t.game, "Wastes", 3);
    activate(t.game, vat);
    expect(tokensNamed(t.game, "Grizzly Bears")).toBe(0);
  });
});

describe("a Saga's chapters over the card it exiled (The Cloning of Shredder)", () => {
  it("chapter I exiles and copies; II and III copy the same card", () => {
    const { game, a } = table();
    const card = toGraveyard(game, "Isamaru, Hound of Konda");
    pickTargets(a, card);
    const saga = spawn(game, "The Cloning of Shredder", A);
    toTurn(game, 1);
    expect(zone(game, card)).toBe("exile");
    expect(tokensNamed(game, "Isamaru, Hound of Konda")).toBe(1);

    toTurn(game, 3);
    expect(tokensNamed(game, "Isamaru, Hound of Konda")).toBe(2);
    toTurn(game, 5);
    expect(tokensNamed(game, "Isamaru, Hound of Konda")).toBe(3);
    expect(zone(game, saga)).toBe("graveyard");
    // The legend rule has nothing to say: none of them is legendary.
    for (const id of tokens(game)) {
      // "Isn't legendary and is a Mutant in addition to its other types."
      expect(supertypes(game, id)).not.toContain("legendary");
      expect(subtypes(game, id)).toEqual(expect.arrayContaining(["Dog", "Mutant"]));
    }
  });
});

describe("a copy of the creature enchanted (Followed Footsteps)", () => {
  const onBears = ({ game }: Table): { aura: ObjectId; bears: ObjectId } => {
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 5);
    const aura = toHand(game, "Followed Footsteps");
    cast(game, aura, { targets: [ref(bears)] });
    return { aura, bears };
  };

  it("gives the Aura's controller a copy at their upkeep, whoever controls the creature", () => {
    const t = table();
    onBears(t);
    toTurn(t.game, 2);
    expect(tokensNamed(t.game, "Grizzly Bears")).toBe(0);
    toTurn(t.game, 3);
    expect(controller(t.game, theToken(t.game, "Grizzly Bears"))).toBe(A);
  });

  it("makes nothing if the creature left first, the Aura going with it", () => {
    const t = table();
    const { aura, bears } = onBears(t);
    destroy(t.game, bears);
    toTurn(t.game, 3);
    expect(zone(t.game, aura)).toBe("graveyard");
    expect(tokensNamed(t.game, "Grizzly Bears")).toBe(0);
  });
});

describe("a copy of the card exiled until this leaves (Mardu Siegebreaker)", () => {
  const withExile = ({ game, a }: Table): { bears: ObjectId; siege: ObjectId } => {
    const bears = spawn(game, "Grizzly Bears", A);
    const siege = spawn(game, "Mardu Siegebreaker", A);
    pickTargets(a, bears);
    game.debugAnnounceEntry(siege);
    settle(game);
    return { bears, siege };
  };

  it("attacks each opponent with a tapped copy of its own, sacrificed at your next end step", () => {
    const t = table({ players: 3 });
    const { bears, siege } = withExile(t);
    expect(zone(t.game, bears)).toBe("exile");

    t.a.declareAttackersFn = () => [{ attacker: siege, defender: B }];
    toAttackResolved(t.game);
    const made = named(t.game, "Grizzly Bears");
    expect(made.map((id) => t.game.state.objects[id].attacking).sort()).toEqual([B, C].sort());
    expect(made.every((id) => t.game.state.objects[id].tapped)).toBe(true);

    toStep(t.game, "end");
    settle(t.game);
    expect(tokensNamed(t.game, "Grizzly Bears")).toBe(0);
    expect(zone(t.game, bears)).toBe("exile");
  });

  it("copies nothing once the card is back, the source having left", () => {
    const t = table();
    const { bears, siege } = withExile(t);
    t.a.declareAttackersFn = () => [{ attacker: siege, defender: B }];
    t.game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.zones.shared.stack.length > 0);
    destroy(t.game, siege);
    settle(t.game);
    expect(zone(t.game, bears)).toBe("battlefield");
    expect(tokens(t.game)).toHaveLength(0);
  });

  it("makes only tapped tokens of a noncreature card: it can't attack (rule 506.3)", () => {
    const t = table();
    const { bears, siege } = withExile(t);
    t.game.state.objects[bears].exiledUntil = undefined;
    const land = toExile(t.game, "Wastes", A);
    t.game.state.objects[land].exiledUntil = {
      source: siege,
      zoneChangeCount: t.game.state.objects[siege].zoneChangeCount ?? 0,
    };
    t.a.declareAttackersFn = () => [{ attacker: siege, defender: B }];
    toAttackResolved(t.game);
    const token = named(t.game, "Wastes").filter((id) => t.game.state.objects[id].isToken === true)[0];
    expect(t.game.state.objects[token].tapped).toBe(true);
    expect(t.game.state.objects[token].attacking ?? null).toBe(null);
  });
});

describe("each card in exile matching (Altaïr Ibn-La'Ahad)", () => {
  it("copies every memory card you own, the one just exiled too; end of combat exiles them", () => {
    const { game, a } = table();
    const altair = spawn(game, "Altaïr Ibn-La'Ahad", A);
    const assassin = toGraveyard(game, "Royal Assassin");
    const earlier = toExile(game, "Hill Giant", A);
    game.state.objects[earlier].counters = { memory: 1 };
    toExile(game, "Grizzly Bears", A); // no counter
    const theirs = toExile(game, "Isamaru, Hound of Konda", B); // not yours
    game.state.objects[theirs].counters = { memory: 1 };
    pickTargets(a, assassin);
    a.declareAttackersFn = () => [{ attacker: altair, defender: B }];
    toAttackResolved(game);
    expect(zone(game, assassin)).toBe("exile");
    expect(counters(game, assassin, "memory")).toBe(1);
    expect(tokensNamed(game, "Royal Assassin")).toBe(1);
    expect(tokensNamed(game, "Hill Giant")).toBe(1);
    expect(tokensNamed(game, "Grizzly Bears")).toBe(0);
    expect(tokensNamed(game, "Isamaru, Hound of Konda")).toBe(0);
    const giant = theToken(game, "Hill Giant");
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(game.state.objects[giant].attacking).toBe(B);
    toStep(game, "postcombat-main");
    settle(game);
    expect(tokensNamed(game, "Hill Giant")).toBe(0);
    // The card itself stays exiled, to be copied again.
    expect(zone(game, earlier)).toBe("exile");
  });
});

describe("a copy of the card exiled as a cost (Dollhouse of Horrors)", () => {
  it("copies the one chosen, a Construct with the granted static, hasty until end of turn", () => {
    const { game, a } = table();
    const house = spawn(game, "Dollhouse of Horrors", A);
    const giant = toGraveyard(game, "Hill Giant");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    pickFromZone(a, giant);
    activate(game, house);
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, bears)).toBe("graveyard");
    const token = theToken(game, "Hill Giant");
    expect(types(game, token)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, token)).toEqual(expect.arrayContaining(["Giant", "Construct"]));
    // 0/0 base, +1/+1 for the one Construct it is.
    expect(pt(game, token)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, token).has("haste")).toBe(true);
    nextTurn(game);
    expect(keywords(game, token).has("haste")).toBe(false);
  });

  it("with one candidate asks nothing, and counts a second Construct", () => {
    const { game } = table();
    const house = spawn(game, "Dollhouse of Horrors", A);
    const land = lands(game, "Wastes", 2);
    toGraveyard(game, "Hill Giant");
    activate(game, house);
    const first = theToken(game, "Hill Giant");
    expect(controller(game, first)).toBe(A);
    void land;
    nextTurn(game);
    nextTurn(game);
    toGraveyard(game, "Grizzly Bears");
    activate(game, house);
    expect(pt(game, first)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theToken(game, "Grizzly Bears"))).toEqual({ power: 2, toughness: 2 });
  });
});

describe("a copy of each card exiled this way (Foggy Swamp Visions)", () => {
  it("copies each under the caster, whoever's graveyard, sacrificed at their next end step", () => {
    const { game } = table();
    const mine = toGraveyard(game, "Hill Giant", A);
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    lands(game, "Swamp", 5);
    cast(game, toHand(game, "Foggy Swamp Visions"), { x: 2, targets: [ref(mine), ref(theirs)] });
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    expect(controller(game, theToken(game, "Grizzly Bears"))).toBe(A);
    expect(tokensNamed(game, "Hill Giant", A)).toBe(1);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Hill Giant")).toBe(0);
    expect(tokensNamed(game, "Grizzly Bears")).toBe(0);
  });

  it("waits for the caster's own end step when cast on another turn", () => {
    const { game } = table();
    const card = toGraveyard(game, "Hill Giant", A);
    nextTurn(game); // bob's turn
    game.debugApplyEffect(A, {
      kind: "sequence",
      effects: [
        { kind: "exile", target: 0 },
        { kind: "create-token-copy", of: "exiled-this-way", count: 1, sacrificeAtEndStep: true, atYourNextEndStep: true },
      ],
    }, [ref(card)]);
    settle(game);
    expect(tokensNamed(game, "Hill Giant", A)).toBe(1);
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "upkeep");
    // Bob's end step has gone by.
    expect(tokensNamed(game, "Hill Giant", A)).toBe(1);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Hill Giant")).toBe(0);
  });
});

describe("a read number of copies (Rionya, Fire Dancer)", () => {
  it("is one plus the instants and sorceries you've cast this turn", () => {
    const { game, a } = table();
    spawn(game, "Rionya, Fire Dancer", A);
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    pickTargets(a, bears);
    toStep(game, "declare-attackers");
    settle(game);
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(3);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Grizzly Bears")).toBe(0);
  });
});
