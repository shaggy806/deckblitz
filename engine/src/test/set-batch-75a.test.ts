/**
 * Set walk batch 75, part a (2026-10-15): the rest of Marvel Super Heroes (MSH).
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const draw = (game: ReturnType<typeof table>["game"], n: number): void => {
  game.debugApplyEffect(A, { kind: "draw", amount: n });
  settle(game);
};

describe("Jessica Jones, Private Eye", () => {
  it("taps and takes a stun counter to exile the top cards equal to her power", () => {
    const { game } = table();
    const jessica = spawn(game, "Jessica Jones, Private Eye");
    const exiled = () => game.state.zones.shared.exile.length;
    activate(game, jessica);
    expect(game.state.objects[jessica].tapped).toBe(true);
    expect(counters(game, jessica, "stun")).toBe(1);
    expect(exiled()).toBe(2);
  });
});

describe("Grim Reaper, Lethal Legionnaire", () => {
  it("pays {3}{B} to return a creature card tapped and attacking with a finality counter", () => {
    const { game, a } = table();
    const reaper = spawn(game, "Grim Reaper, Lethal Legionnaire");
    lands(game, "Swamp", 4);
    const bears = toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    pickTargets(a, bears);
    attack(game, a, [reaper]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears, "finality")).toBe(1);
    expect(life(game, B)).toBe(15);
  });

  it("returns nothing when you decline to pay", () => {
    const { game, a } = table();
    const reaper = spawn(game, "Grim Reaper, Lethal Legionnaire");
    lands(game, "Swamp", 4);
    const bears = toGraveyard(game, "Grizzly Bears");
    pickModes(a);
    attack(game, a, [reaper]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });
});

describe("Rapid Rescue", () => {
  it("mills two, may return a milled permanent card, and gains 2 life", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const bolt = toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, bears);
    cast(game, toHand(game, "Rapid Rescue"));
    expect(seen.offered).toEqual([bears]);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game)).toBe(22);
  });
});

describe("Alien Invasion", () => {
  it("makes a hasty Alien at combat with a counter per invasion counter, then adds one", () => {
    const { game } = table();
    const invasion = spawn(game, "Alien Invasion");
    game.state.objects[invasion].counters.invasion = 2;
    toStep(game, "begin-combat");
    settle(game);
    const [alien] = named(game, "Alien Token (Alien Invasion)");
    expect(alien).toBeDefined();
    expect(counters(game, alien)).toBe(2);
    expect(keywords(game, alien).has("haste")).toBe(true);
    expect(counters(game, invasion, "invasion")).toBe(3);
  });

  it("the first token gets no counters", () => {
    const { game } = table();
    const invasion = spawn(game, "Alien Invasion");
    toStep(game, "begin-combat");
    settle(game);
    const [alien] = named(game, "Alien Token (Alien Invasion)");
    expect(pt(game, alien)).toEqual({ power: 1, toughness: 1 });
    expect(counters(game, invasion, "invasion")).toBe(1);
  });
});

describe("Repulsor Blast", () => {
  it("deals 5 to the creature, and 2 to its controller only when cast using teamwork", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const helper = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Repulsor Blast"), { targets: [ref(angel)], kicked: true, tap: [helper] });
    expect(zone(game, angel)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });

  it("without teamwork, only the 5 damage", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Repulsor Blast"), { targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Atlantean Cavalry", () => {
  it("gets one +1/+1 counter on the second card drawn in a turn, not more", () => {
    const { game } = table();
    const cavalry = spawn(game, "Atlantean Cavalry");
    draw(game, 3);
    expect(counters(game, cavalry)).toBe(1);
  });
});

describe("Roxxon Brutes", () => {
  it("puts a +1/+1 counter on target creature on the second card drawn in a turn", () => {
    const { game, a } = table();
    spawn(game, "Roxxon Brutes");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    draw(game, 3);
    expect(counters(game, bears)).toBe(1);
  });
});

describe("S.H.I.E.L.D. Flying Car", () => {
  it("exiles a creature you control and returns it at the next end step", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    const [bears] = named(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "S.H.I.E.L.D. Flying Car");
    expect(named(game, "Grizzly Bears")).toHaveLength(0);
    toStep(game, "end");
    settle(game);
    expect(named(game, "Grizzly Bears")).toHaveLength(1);
  });

  it("may exile nothing", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, null);
    enter(game, "S.H.I.E.L.D. Flying Car");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Arnim Zola, Bio-Fanatic", () => {
  it("makes a tapped Villain only with two or more creature cards in your graveyard", () => {
    const { game } = table();
    const zola = spawn(game, "Arnim Zola, Bio-Fanatic");
    lands(game, "Swamp", 3);
    toGraveyard(game, "Grizzly Bears");
    expect(() => activate(game, zola)).toThrow();
    toGraveyard(game, "Savannah Lions");
    activate(game, zola);
    const [villain] = named(game, "Villain Token");
    expect(villain).toBeDefined();
    expect(game.state.objects[villain].tapped).toBe(true);
  });
});

describe("Fin Fang Foom", () => {
  it("copies an instant or sorcery that targets a land, and gets two +1/+1 counters", () => {
    const { game, a } = table();
    const foom = spawn(game, "Fin Fang Foom");
    lands(game, "Mountain", 3);
    const [first, second] = lands(game, "Wastes", 2, B);
    pickTargets(a, second);
    cast(game, toHand(game, "Stone Rain"), { targets: [ref(first)] });
    expect(zone(game, first)).toBe("graveyard");
    expect(zone(game, second)).toBe("graveyard");
    expect(counters(game, foom)).toBe(2);
  });

  it("doesn't trigger on a spell that targets only a creature", () => {
    const { game } = table();
    const foom = spawn(game, "Fin Fang Foom");
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(counters(game, foom)).toBe(0);
  });
});

describe("Moon Girl and Devil Dinosaur", () => {
  it("becomes a 6/6 with trample until end of turn on the second card drawn", () => {
    const { game } = table();
    const moon = spawn(game, "Moon Girl and Devil Dinosaur");
    draw(game, 1);
    expect(pt(game, moon)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, moon).has("trample")).toBe(true);
    toStep(game, "precombat-main", B);
    expect(pt(game, moon)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, moon).has("trample")).toBe(false);
  });

  it("draws for an artifact you control entering, only once each turn", () => {
    const { game } = table();
    spawn(game, "Moon Girl and Devil Dinosaur");
    const before = hand(game).length;
    enter(game, "Ornithopter");
    enter(game, "Ornithopter");
    enter(game, "Ornithopter", B);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Colleen Wing, Street Samurai", () => {
  it("grows when you cast a spell that targets a creature you control", () => {
    const { game } = table();
    const colleen = spawn(game, "Colleen Wing, Street Samurai");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(counters(game, colleen)).toBe(1);
  });

  it("not for a spell that targets an opponent's creature", () => {
    const { game } = table();
    const colleen = spawn(game, "Colleen Wing, Street Samurai");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(theirs)] });
    expect(counters(game, colleen)).toBe(0);
  });
});

describe("Swordsman, Sharp Scoundrel", () => {
  it("attaches an Equipment you control when another Villain you control enters", () => {
    const { game, a } = table();
    spawn(game, "Swordsman, Sharp Scoundrel");
    const splitter = spawn(game, "Bonesplitter");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, splitter, bears);
    enter(game, "Villain Token");
    expect(game.state.objects[splitter].attachedTo).toBe(bears);
  });

  it("an equipped creature you control connives as it attacks; an unequipped one doesn't", () => {
    const { game, a } = table();
    spawn(game, "Swordsman, Sharp Scoundrel");
    const splitter = spawn(game, "Bonesplitter");
    const bears = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    game.state.objects[splitter].attachedTo = bears;
    const before = graveyard(game).length;
    attack(game, a, [bears, lions]);
    // One connive: a card drawn and one discarded.
    expect(graveyard(game).length).toBe(before + 1);
  });
});

describe("The Ruinous Wrecking Crew", () => {
  it("enters with X counters and offers up to X modes, with their targets", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 1);
    game.debugApplyEffect(B, { kind: "create-token", token: "Villain Token", count: 1 });
    const [token] = named(game, "Villain Token", B);
    let most = -1;
    a.chooseModesFn = (_view, _min, max) => {
      most = max;
      return [1, 2];
    };
    pickTargets(a, B, token);
    cast(game, toHand(game, "The Ruinous Wrecking Crew"), { x: 2 });
    const [crew] = named(game, "The Ruinous Wrecking Crew");
    expect(counters(game, crew)).toBe(2);
    expect(most).toBe(2);
    expect(life(game, B)).toBe(18);
    expect(tokensNamed(game, "Villain Token", B)).toBe(0);
  });
});

describe("Agent 13, Sharon Carter", () => {
  it("investigates when a creature you control attacks alone", () => {
    const { game, a } = table();
    spawn(game, "Agent 13, Sharon Carter");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });

  it("not when two attack", () => {
    const { game, a } = table();
    const agent = spawn(game, "Agent 13, Sharon Carter");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [agent, bears]);
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
  });
});
