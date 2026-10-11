/**
 * The preparation cards (rule 722) beyond prepare.test.ts's two: Secrets of Strixhaven's and Reality Fracture's (2026-10-11).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  graveyard,
  hand,
  lands,
  life,
  named,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

const copyOf = (game: Game, id: ObjectId): ObjectId | undefined => game.state.objects[id].prepared?.copy;
const prepared = (game: Game, id: ObjectId): boolean => game.state.objects[id].prepared !== undefined;
const enterPrepared = (game: Game, name: string, player: PlayerId = A): ObjectId => {
  const id = game.debugSpawn(name, player, "battlefield", { announceEntry: true, summoningSick: false });
  settle(game);
  return id;
};
/** On the battlefield and not prepared: one without "enters prepared". */
const unprepared = (game: Game, name: string, player: PlayerId = A): ObjectId => {
  const id = spawn(game, name, player);
  expect(prepared(game, id)).toBe(false);
  return id;
};
/** One that enters prepared (a silent spawn included), unprepared by
 * casting its copy: paid with `n` of `land`, at `targets`. */
const spent = (
  game: Game,
  name: string,
  land: string,
  n: number,
  targets: (game: Game) => readonly ObjectId[] | readonly PlayerId[] = () => [],
): ObjectId => {
  const id = spawn(game, name);
  lands(game, land, n);
  cast(game, copyOf(game, id)!, { via: "prepared", targets: targets(game).map(ref) });
  expect(prepared(game, id)).toBe(false);
  return id;
};
const kill = (game: Game, n: number, player: PlayerId = B): void => {
  for (let i = 0; i < n; i++) destroy(game, spawn(game, "Grizzly Bears", player));
  settle(game);
};

describe("Blazing Firesinger", () => {
  it("enters prepared with Seething Song, whose copy adds {R}{R}{R}{R}{R}", () => {
    const { game } = table();
    const singer = enterPrepared(game, "Blazing Firesinger");
    const copy = copyOf(game, singer)!;
    expect(game.state.objects[copy].cardName).toBe("Seething Song");
    lands(game, "Mountain", 3);
    cast(game, copy, { via: "prepared" });
    expect(game.state.players[A].manaPool.filter((u) => u.type === "R")).toHaveLength(5);
    expect(prepared(game, singer)).toBe(false);
  });
});

describe("Bloodline Recollector", () => {
  it("becomes prepared at each end step once three creatures died this turn, anyone's", () => {
    const { game } = table();
    const rec = unprepared(game, "Bloodline Recollector");
    kill(game, 2, B);
    kill(game, 1, A);
    toStep(game, "end");
    settle(game);
    expect(prepared(game, rec)).toBe(true);
    const copy = copyOf(game, rec)!;
    expect(game.state.objects[copy].cardName).toBe("Ancestral Craving");
    // Ancestral Craving: target player draws three and loses 3 life.
    lands(game, "Swamp", 1);
    const before = hand(game, B).length;
    cast(game, copy, { via: "prepared", targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before + 3);
    expect(life(game, B)).toBe(17);
  });

  it("doesn't with only two dead", () => {
    const { game } = table();
    const rec = unprepared(game, "Bloodline Recollector");
    kill(game, 2);
    toStep(game, "end");
    settle(game);
    expect(prepared(game, rec)).toBe(false);
  });
});

describe("Eiganjo Dynastorian", () => {
  it("attacking with two creatures prepares it; Replenish returns the enchantments", () => {
    const { game, a } = table();
    const fox = unprepared(game, "Eiganjo Dynastorian");
    const bears = spawn(game, "Grizzly Bears");
    const target = spawn(game, "Grizzly Bears", B);
    attack(game, a, [fox, bears]);
    settle(game);
    expect(prepared(game, fox)).toBe(true);
    const copy = copyOf(game, fox)!;
    expect(game.state.objects[copy].cardName).toBe("Replenish");
    const anthem = toGraveyard(game, "Glorious Anthem");
    const aura = toGraveyard(game, "Pacifism");
    lands(game, "Plains", 4);
    a.chooseEnchantFn =(_view, _source, options) => (options.includes(target) ? target : options[0]);
    cast(game, copy, { via: "prepared" });
    expect(zone(game, anthem)).toBe("battlefield");
    expect(zone(game, aura)).toBe("battlefield");
    expect(game.state.objects[aura].attachedTo).toBe(target);
  });

  it("attacking with one doesn't", () => {
    const { game, a } = table();
    const fox = unprepared(game, "Eiganjo Dynastorian");
    attack(game, a, [fox]);
    settle(game);
    expect(prepared(game, fox)).toBe(false);
  });
});

describe("Emeritus of Abundance", () => {
  it("attacking prepares it only while you control eight or more lands", () => {
    const { game, a } = table();
    // Regrowth's two Forests and five more: seven lands.
    const elf = spent(game, "Emeritus of Abundance", "Forest", 2, (g) => [toGraveyard(g, "Wastes")]);
    lands(game, "Forest", 5);
    attack(game, a, [elf]);
    settle(game);
    expect(prepared(game, elf)).toBe(false);
    lands(game, "Forest", 1);
    toStep(game, "precombat-main");
    attack(game, a, [elf]);
    settle(game);
    expect(prepared(game, elf)).toBe(true);
    expect(game.state.objects[copyOf(game, elf)!].cardName).toBe("Regrowth");
  });
});

describe("Emeritus of Ideation", () => {
  it("attacking, exiling eight cards from your graveyard prepares it with Ancestral Recall", () => {
    const { game, a } = table();
    const wizard = spent(game, "Emeritus of Ideation", "Island", 1, () => [A]);
    const cards = Array.from({ length: 8 }, () => toGraveyard(game, "Wastes"));
    pickModes(a, 0);
    attack(game, a, [wizard]);
    settle(game);
    expect(cards.every((id) => zone(game, id) === "exile")).toBe(true);
    expect(prepared(game, wizard)).toBe(true);
    const copy = copyOf(game, wizard)!;
    expect(game.state.objects[copy].cardName).toBe("Ancestral Recall");
    lands(game, "Island", 1);
    const before = hand(game).length;
    cast(game, copy, { via: "prepared", targets: [ref(A)] });
    expect(hand(game).length).toBe(before + 3);
  });

  it("with only seven cards there, saying yes doesn't prepare it", () => {
    const { game, a } = table();
    const wizard = spent(game, "Emeritus of Ideation", "Island", 1, () => [A]);
    for (let i = 0; i < 7; i++) toGraveyard(game, "Wastes");
    pickModes(a, 0);
    attack(game, a, [wizard]);
    settle(game);
    expect(prepared(game, wizard)).toBe(false);
  });

  it("declining keeps the graveyard and leaves it unprepared", () => {
    const { game, a } = table();
    const wizard = spent(game, "Emeritus of Ideation", "Island", 1, () => [A]);
    for (let i = 0; i < 8; i++) toGraveyard(game, "Wastes");
    attack(game, a, [wizard]);
    settle(game);
    expect(graveyard(game)).toHaveLength(8);
    expect(prepared(game, wizard)).toBe(false);
  });
});

describe("Emeritus of Woe", () => {
  it("becomes prepared again at your end step after two creatures died", () => {
    const { game } = table();
    const woe = enterPrepared(game, "Emeritus of Woe");
    const copy = copyOf(game, woe)!;
    expect(game.state.objects[copy].cardName).toBe("Demonic Tutor");
    lands(game, "Swamp", 2);
    cast(game, copy, { via: "prepared" });
    expect(prepared(game, woe)).toBe(false);
    kill(game, 2);
    toStep(game, "end");
    settle(game);
    expect(prepared(game, woe)).toBe(true);
  });

  it("not at an opponent's end step", () => {
    const { game } = table();
    const woe = spent(game, "Emeritus of Woe", "Swamp", 2);
    toStep(game, "precombat-main", B);
    kill(game, 2);
    toStep(game, "end", B);
    settle(game);
    expect(prepared(game, woe)).toBe(false);
  });
});

describe("Grave Researcher", () => {
  it("counts creature cards after the surveil: the third, surveilled away, prepares it", () => {
    const { game, a } = table();
    const troll = unprepared(game, "Grave Researcher");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    const top = toLibrary(game, "Hill Giant");
    a.chooseScryFn = (_view, cards) => cards.filter((id) => id === top);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, top)).toBe("graveyard");
    expect(prepared(game, troll)).toBe(true);
    expect(game.state.objects[copyOf(game, troll)!].cardName).toBe("Reanimate");
  });

  it("kept on top, two creature cards aren't enough", () => {
    const { game } = table();
    const troll = unprepared(game, "Grave Researcher");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    toLibrary(game, "Hill Giant");
    toStep(game, "upkeep");
    settle(game);
    expect(prepared(game, troll)).toBe(false);
  });
});

describe("Harmonized Trio", () => {
  it("taps itself and two other creatures, summoning sick ones too, to become prepared", () => {
    const { game } = table();
    const trio = unprepared(game, "Harmonized Trio");
    const x = spawn(game, "Grizzly Bears", A, { sick: true });
    const y = spawn(game, "Grizzly Bears", A, { sick: true });
    activate(game, trio, 0);
    expect(game.state.objects[x].tapped && game.state.objects[y].tapped).toBe(true);
    expect(prepared(game, trio)).toBe(true);
    expect(game.state.objects[copyOf(game, trio)!].cardName).toBe("Brainstorm");
  });
});

describe("Konstrari Improviser", () => {
  it("enters prepared; its Soul Tether makes a Heartwood token", () => {
    const { game } = table();
    const human = enterPrepared(game, "Konstrari Improviser");
    lands(game, "Mountain", 3);
    cast(game, copyOf(game, human)!, { via: "prepared" });
    expect(named(game, "Heartwood Token")).toHaveLength(1);
  });
});

describe("Woodwork Prodigy", () => {
  it("becomes prepared at your upkeep only if it isn't", () => {
    const { game } = table();
    const cat = unprepared(game, "Woodwork Prodigy");
    toStep(game, "upkeep");
    settle(game);
    expect(prepared(game, cat)).toBe(true);
    const copy = copyOf(game, cat)!;
    expect(game.state.objects[copy].cardName).toBe("Soul Tether");
    // Already prepared: it doesn't even trigger (the intervening if).
    toStep(game, "upkeep");
    expect(game.state.zones.shared.stack).toHaveLength(0);
    expect(copyOf(game, cat)).toBe(copy);
  });
});

describe("Scheming Silvertongue", () => {
  it("becomes prepared at your second main phase after gaining 2 life", () => {
    const { game } = table();
    const vamp = unprepared(game, "Scheming Silvertongue");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 }, []);
    toStep(game, "postcombat-main");
    settle(game);
    expect(prepared(game, vamp)).toBe(true);
    expect(game.state.objects[copyOf(game, vamp)!].cardName).toBe("Sign in Blood");
  });

  it("not after gaining 1", () => {
    const { game } = table();
    const vamp = unprepared(game, "Scheming Silvertongue");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 }, []);
    toStep(game, "postcombat-main");
    settle(game);
    expect(prepared(game, vamp)).toBe(false);
  });
});

describe("Variable Chaser", () => {
  it("Arc of Fortune: each player may wheel for seven — one who declines keeps their hand", () => {
    const { game, a } = table();
    const chaser = enterPrepared(game, "Variable Chaser");
    const copy = copyOf(game, chaser)!;
    expect(game.state.objects[copy].cardName).toBe("Arc of Fortune");
    lands(game, "Island", 3);
    const mine = toHand(game, "Grizzly Bears");
    const theirs = [...hand(game, B), toHand(game, "Grizzly Bears", B)];
    pickModes(a, 0);
    cast(game, copy, { via: "prepared" });
    expect(zone(game, mine)).toBe("graveyard");
    expect(hand(game)).toHaveLength(7);
    expect(hand(game, B)).toEqual(theirs);
  });
});

describe("Codie, Ravenous Codex", () => {
  it("copies a prepared spell, and prepares every creature you control", () => {
    const { game } = table();
    spawn(game, "Codie, Ravenous Codex");
    const singer = enterPrepared(game, "Blazing Firesinger");
    lands(game, "Mountain", 3);
    cast(game, copyOf(game, singer)!, { via: "prepared" });
    // The copy's five and the spell's five.
    expect(game.state.players[A].manaPool.filter((u) => u.type === "R")).toHaveLength(10);
    toStep(game, "postcombat-main");
    const codie = named(game, "Codie, Ravenous Codex")[0];
    const bears = spawn(game, "Grizzly Bears");
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, land, 1);
    activate(game, codie, 0);
    expect(prepared(game, singer)).toBe(true);
    expect(prepared(game, bears)).toBe(false);
  });

  it("doesn't copy the same spell cast from a hand", () => {
    const { game } = table();
    spawn(game, "Codie, Ravenous Codex");
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Seething Song"));
    expect(game.state.players[A].manaPool.filter((u) => u.type === "R")).toHaveLength(5);
  });
});

describe("Hexhaven Dueling Arena", () => {
  it("{2}: only a creature that attacked this turn, as a sorcery", () => {
    const { game, a } = table();
    const arena = spawn(game, "Hexhaven Dueling Arena");
    const attacker = unprepared(game, "Woodwork Prodigy");
    const stayed = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    attack(game, a, [attacker]);
    const offer = game
      .legalActions(A)
      .find((x) => x.kind === "activate-ability" && x.source === arena && x.abilityIndex === 1);
    const options = offer?.kind === "activate-ability" ? offer.targetOptions[0] : [];
    expect(options).toContainEqual(ref(attacker));
    expect(options).not.toContainEqual(ref(stayed));
    activate(game, arena, 1, { targets: [ref(attacker)] });
    expect(prepared(game, attacker)).toBe(true);
  });
});
