/**
 * Commander 2019 and Core Set 2020, group B. One test per card whose
 * behaviour is more than a stat line or an already-tested pattern.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Volrath, the Shapestealer", () => {
  it("becomes a 7/5 copy of a creature with a counter, keeps the ability, and reverts on its controller's next turn", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const volrath = spawn(game, "Volrath, the Shapestealer");
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(giant)]);
    // Only a creature with a counter on it.
    expect(() => activate(game, volrath, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, volrath, 0, { targets: [ref(giant)] });
    expect(subtypes(game, volrath)).toContain("Giant");
    expect(pt(game, volrath)).toEqual({ power: 7, toughness: 5 });
    // It still has the ability to become a copy.
    activate(game, volrath, 0, { targets: [ref(giant)] });
    expect(pt(game, volrath)).toEqual({ power: 7, toughness: 5 });
    nextTurn(game);
    expect(subtypes(game, volrath)).toContain("Giant");
    nextTurn(game);
    expect(subtypes(game, volrath)).toContain("Shapeshifter");
    expect(subtypes(game, volrath)).not.toContain("Giant");
  });
});

describe("Nightmare Unmaking", () => {
  it("compares power with the hand's size as it resolves, the spell itself not counted", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "discard-hand", who: "you" }, []);
    lands(game, "Swamp", 5);
    toHand(game, "Wastes");
    toHand(game, "Wastes");
    toHand(game, "Wastes");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const elephant = spawn(game, "Loxodon Lifechanter", B);
    const card = toHand(game, "Nightmare Unmaking");
    expect(hand(game)).toHaveLength(4);
    cast(game, card, { modes: [1] });
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, elephant)).toBe("battlefield");
    lands(game, "Swamp", 5);
    cast(game, toHand(game, "Nightmare Unmaking"), { modes: [0] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, elephant)).toBe("exile");
  });
});

describe("Blightbeetle", () => {
  it("stops +1/+1 counters on opponents' creatures only", () => {
    const { game } = table();
    spawn(game, "Blightbeetle");
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Battlegrowth"), { targets: [ref(theirs)] });
    cast(game, toHand(game, "Battlegrowth"), { targets: [ref(mine)] });
    expect(counters(game, theirs)).toBe(0);
    expect(counters(game, mine)).toBe(1);
  });
});

describe("Woodland Champion", () => {
  it("gets one counter per token entering together", () => {
    const { game } = table();
    const champion = spawn(game, "Woodland Champion");
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Raise the Alarm"));
    expect(counters(game, champion)).toBe(2);
  });
});

describe("Loxodon Lifechanter", () => {
  it("sets the life total to the total toughness, by losing or gaining the difference", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    enter(game, "Loxodon Lifechanter");
    expect(life(game)).toBe(8);
    game.state.players[A].life = 3;
    enter(game, "Loxodon Lifechanter");
    expect(life(game)).toBe(14);
    pickModes(a);
    enter(game, "Loxodon Lifechanter");
    expect(life(game)).toBe(14);
  });

  it("pumps by the life total", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    const elephant = spawn(game, "Loxodon Lifechanter");
    activate(game, elephant, 0);
    expect(pt(game, elephant)).toEqual({ power: 24, toughness: 26 });
  });
});

describe("Mask of Immolation", () => {
  it("makes an Elemental wearing it, which can sacrifice itself to deal 1 damage", () => {
    const { game } = table();
    enter(game, "Mask of Immolation");
    const [token] = named(game, "1/1 Red Elemental Token", A);
    expect(token).toBeDefined();
    activate(game, token!, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(tokensNamed(game, "1/1 Red Elemental Token", A)).toBe(0);
  });
});

describe("Aether Gust", () => {
  it("puts a red or green permanent into its owner's library, and can't target a blue one", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const crow = spawn(game, "Storm Crow", B);
    expect(() => cast(game, toHand(game, "Aether Gust"), { targets: [ref(crow)] })).toThrow();
    cast(game, toHand(game, "Aether Gust"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("library");
  });
});

describe("Boneclad Necromancer", () => {
  it("exiles the targeted creature card and makes a Zombie", () => {
    const { game, a } = table();
    const card = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, card);
    pickModes(a, 0);
    enter(game, "Boneclad Necromancer");
    expect(zone(game, card)).toBe("exile");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
  });
});

describe("Goblin Bird-Grabber", () => {
  it("activates only while you control a creature with flying", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const goblin = spawn(game, "Goblin Bird-Grabber");
    expect(() => activate(game, goblin, 0)).toThrow();
    spawn(game, "Storm Crow");
    activate(game, goblin, 0);
    expect(keywords(game, goblin).has("flying")).toBe(true);
  });
});

describe("Twinblade Paladin", () => {
  it("grows on life gain and has double strike at 25 or more life", () => {
    const { game } = table();
    const paladin = spawn(game, "Twinblade Paladin");
    game.state.players[A].life = 22;
    enter(game, "Angel of Mercy");
    expect(counters(game, paladin)).toBe(1);
    expect(keywords(game, paladin).has("double-strike")).toBe(true);
    game.state.players[A].life = 24;
    expect(keywords(game, paladin).has("double-strike")).toBe(false);
  });
});

describe("Creeping Trailblazer", () => {
  it("pumps other Elementals, and itself by the Elementals you control", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    const trailblazer = spawn(game, "Creeping Trailblazer");
    const token = spawn(game, "1/1 Red Elemental Token");
    expect(pt(game, token)).toEqual({ power: 2, toughness: 1 });
    expect(pt(game, trailblazer)).toEqual({ power: 2, toughness: 2 });
    activate(game, trailblazer, 0);
    expect(pt(game, trailblazer)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Chandra, Novice Pyromancer", () => {
  it("+1 pumps Elementals you control; −2 deals 2 damage", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra, Novice Pyromancer");
    game.state.objects[chandra]!.counters.loyalty = 5;
    const token = spawn(game, "1/1 Red Elemental Token");
    const bears = spawn(game, "Grizzly Bears");
    loyalty(game, chandra, 1);
    expect(pt(game, token)).toEqual({ power: 3, toughness: 1 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    nextTurn(game);
    nextTurn(game);
    loyalty(game, chandra, -2, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
  });
});

describe("Retributive Wand", () => {
  it("deals 5 damage when it's put into a graveyard from the battlefield", () => {
    const { game, a } = table();
    const wand = spawn(game, "Retributive Wand");
    pickTargets(a, B);
    destroy(game, wand);
    expect(life(game, B)).toBe(15);
  });
});
