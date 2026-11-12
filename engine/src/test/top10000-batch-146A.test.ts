/**
 * Batch 308, group A — EDHREC ranks 10246–12810. One test per clause most
 * likely to be wrong: modal spells' per-mode targets (Special Move, Desperate
 * Plea's sacrificed-power gate), cost
 * reductions and counter costs (Exploding Barrel, The Duke, Jetfire), the
 * converting Transformers (Goldbug, Jetfire, Casal), "if they do"
 * and "if you do" reads (Gisa's Favorite Shovel, Foot Chopper, Venom), the
 * dice (Clowning Around, Pair o' Dice Lost), and the returns that change what
 * a card is (Fang, Princess Yue).
 */
import { describe, expect, it } from "vitest";

import { nameOf } from "../state.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
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
  subtypes,
  supertypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const addCounters = (game: Game, id: ObjectId, counter: string, amount: number): void => {
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter, amount }, [ref(id)]);
};
const makeTokens = (game: Game, token: string, count: number, player = A): void => {
  game.debugApplyEffect(player, { kind: "create-token", token, count }, []);
  settle(game);
};
const manaOf = (game: Game, type: string): number => game.state.players[A].manaPool.filter((u) => u.type === type).length;

describe("Special Move", () => {
  it("Jump Kick and Foot Toss: destroys the artifact, flings the creature and sacrifices it", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const ring = spawn(game, "Sol Ring", B);
    const giant = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Special Move"), { modes: [0, 2], targets: [ref(ring), ref(giant), ref(B)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Casal, Lurkwood Pathfinder", () => {
  it("pays {1}{G} to transform as she attacks; the Owlbear pumps other legendary creatures", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const casal = spawn(game, "Casal, Lurkwood Pathfinder");
    const isamaru = spawn(game, "Isamaru, Hound of Konda");
    pickModes(a, 0);
    attack(game, a, [casal]);
    expect(subtypes(game, casal)).toContain("Bear");
    expect(pt(game, isamaru)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, isamaru).has("trample")).toBe(true);
    expect(pt(game, casal)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Exploding Barrel", () => {
  it("costs {1} less for each pressure counter", () => {
    const { game } = table();
    const barrel = spawn(game, "Exploding Barrel");
    addCounters(game, barrel, "pressure", 6);
    lands(game, "Wastes", 2);
    const giant = spawn(game, "Hill Giant", B);
    activate(game, barrel, 1, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, barrel)).toBe("graveyard");
  });
});

describe("Allied Teamwork", () => {
  it("makes a 1/1 Ally that it pumps", () => {
    const { game } = table();
    enter(game, "Allied Teamwork");
    const [ally] = named(game, "Ally Token", A);
    expect(pt(game, ally)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Desperate Plea", () => {
  it("returns a creature card no stronger than the sacrificed one and destroys a creature", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const giant = spawn(game, "Hill Giant");
    const bears = toGraveyard(game, "Grizzly Bears");
    const foe = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Desperate Plea"), { modes: [0, 1], targets: [ref(bears), ref(foe)], sacrifice: giant });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, foe)).toBe("graveyard");
  });

  it("leaves a stronger creature card in the graveyard", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears");
    const angel = toGraveyard(game, "Serra Angel");
    cast(game, toHand(game, "Desperate Plea"), { modes: [0], targets: [ref(angel)], sacrifice: bears });
    expect(zone(game, angel)).toBe("graveyard");
  });
});

describe("April O'Neil, Live on the Scene", () => {
  it("investigates for a Mutant, Ninja or Turtle, not for others", () => {
    const { game } = table();
    spawn(game, "April O'Neil, Live on the Scene");
    enter(game, "Grizzly Bears");
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
    enter(game, "Tokka & Rahzar, Unsupervised");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });
});

describe("Swift Demise", () => {
  it("destroys each damaged creature you don't control, sparing yours", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 2);
    const mine = spawn(game, "Serra Angel");
    const theirGiant = spawn(game, "Serra Angel", B);
    const theirBears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Shock"), { targets: [ref(mine)] });
    cast(game, toHand(game, "Shock"), { targets: [ref(theirGiant)] });
    expect(zone(game, theirGiant)).toBe("battlefield");
    cast(game, toHand(game, "Swift Demise"), { targets: [ref(theirBears)] });
    expect(zone(game, theirBears)).toBe("graveyard");
    expect(zone(game, theirGiant)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Gisa's Favorite Shovel", () => {
  it("makes the defending player sacrifice a creature, and a Walker only if they did", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears");
    const shovel = spawn(game, "Gisa's Favorite Shovel");
    activate(game, shovel, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    const giant = spawn(game, "Hill Giant", B);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "postcombat-main");
    expect(zone(game, giant)).toBe("graveyard");
    expect(tokensNamed(game, "Walker Token", A)).toBe(1);
  });

  it("makes no Walker when the defending player has no creature", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears");
    const shovel = spawn(game, "Gisa's Favorite Shovel");
    activate(game, shovel, 0, { targets: [ref(bears)] });
    attack(game, a, [bears]);
    expect(tokensNamed(game, "Walker Token", A)).toBe(0);
  });
});

describe("Tempestra, Dame of Games", () => {
  it("copies another creature you control, not legendary, with haste", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const tempestra = spawn(game, "Tempestra, Dame of Games");
    const isamaru = spawn(game, "Isamaru, Hound of Konda");
    const ring = spawn(game, "Sol Ring");
    activate(game, tempestra, 0, { targets: [ref(isamaru)], sacrifice: ring });
    const copies = named(game, "Isamaru, Hound of Konda", A).filter((id) => id !== isamaru);
    expect(copies).toHaveLength(1);
    expect(zone(game, isamaru)).toBe("battlefield");
    expect(supertypes(game, copies[0])).not.toContain("legendary");
    expect(keywords(game, copies[0]).has("haste")).toBe(true);
    expect(zone(game, ring)).toBe("graveyard");
  });
});

describe("Seismic Tutelage", () => {
  it("puts a counter on entering and doubles them as the creature attacks", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Seismic Tutelage"), { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    attack(game, a, [bears]);
    expect(counters(game, bears)).toBe(2);
  });
});

describe("Spider-Man, Peter Parker", () => {
  it("a life gain puts a counter on a target creature and makes it indestructible", () => {
    const { game, a } = table();
    spawn(game, "Spider-Man, Peter Parker");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 }, []);
    settle(game);
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("indestructible")).toBe(true);
  });
});

describe("Ghost-Spider, Gwen Stacy", () => {
  it("deals damage equal to the number of attacking creatures", () => {
    const { game, a } = table();
    const gwen = spawn(game, "Ghost-Spider, Gwen Stacy");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [gwen, bears]);
    expect(life(game, B)).toBe(20 - 2 - 4 - 2);
  });
});

describe("Long-Lost Lances", () => {
  it("gives equipped creatures first strike and vigilance only during your turn", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const bears = spawn(game, "Grizzly Bears");
    const lances = spawn(game, "Long-Lost Lances");
    activate(game, lances, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    toStep(game, "precombat-main", B);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
  });
});

describe("Master's Guidance", () => {
  it("two legendary attackers put a counter on each of up to two attacking creatures", () => {
    const { game, a } = table();
    spawn(game, "Master's Guidance");
    const isamaru = spawn(game, "Isamaru, Hound of Konda");
    const raph = spawn(game, "Tokka & Rahzar, Unsupervised");
    pickTargets(a, isamaru, raph);
    attack(game, a, [isamaru, raph]);
    expect(counters(game, isamaru)).toBe(1);
    expect(counters(game, raph)).toBe(1);
  });

  it("one legendary attacker doesn't trigger it", () => {
    const { game, a } = table();
    spawn(game, "Master's Guidance");
    const isamaru = spawn(game, "Isamaru, Hound of Konda");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, isamaru, bears);
    attack(game, a, [isamaru, bears]);
    expect(counters(game, isamaru)).toBe(0);
  });
});

describe("Fang, Roku's Companion", () => {
  it("returns once as a Spirit, then stays dead", () => {
    const { game } = table();
    const fang = spawn(game, "Fang, Roku's Companion");
    destroy(game, fang);
    const [back] = named(game, "Fang, Roku's Companion", A);
    expect(back).toBeDefined();
    expect(subtypes(game, back)).toEqual(expect.arrayContaining(["Dragon", "Spirit"]));
    destroy(game, back);
    expect(named(game, "Fang, Roku's Companion", A)).toHaveLength(0);
  });

  it("pumps another legendary creature by his power as he attacks", () => {
    const { game, a } = table();
    const fang = spawn(game, "Fang, Roku's Companion");
    const isamaru = spawn(game, "Isamaru, Hound of Konda");
    pickTargets(a, isamaru);
    attack(game, a, [fang]);
    expect(pt(game, isamaru)).toEqual({ power: 6, toughness: 2 });
  });
});

describe("Amazing Alliance", () => {
  it("gains life equal to the number of legendary attackers", () => {
    const { game, a } = table();
    spawn(game, "Amazing Alliance");
    const isamaru = spawn(game, "Isamaru, Hound of Konda");
    const raph = spawn(game, "Tokka & Rahzar, Unsupervised");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [isamaru, raph, bears]);
    expect(life(game, A)).toBe(22);
  });
});

describe('Miles "Tails" Prower', () => {
  it("gives a Vehicle without flying a flying counter instead of drawing", () => {
    const { game } = table();
    spawn(game, 'Miles "Tails" Prower');
    const before = hand(game).length;
    const mole = enter(game, "Mole Module");
    expect(counters(game, mole, "flying")).toBe(1);
    expect(hand(game).length).toBe(before);
  });
});

describe("Fire Nation Occupation", () => {
  it("makes a Soldier for a spell cast during an opponent's turn, not your own", () => {
    const { game } = table();
    spawn(game, "Fire Nation Occupation");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(tokensNamed(game, "Soldier Token (Fire Nation Attacks)", A)).toBe(0);
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep" && s.priority.holder === A);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(tokensNamed(game, "Soldier Token (Fire Nation Attacks)", A)).toBe(1);
  });
});

describe("Tokka & Rahzar, Unsupervised", () => {
  it("triggers only once each turn", () => {
    const { game } = table();
    const tokka = spawn(game, "Tokka & Rahzar, Unsupervised");
    destroy(game, spawn(game, "Grizzly Bears"));
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(counters(game, tokka)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });
});

describe("Katara's Reversal", () => {
  it("counters a spell and untaps a creature", () => {
    const { game } = table();
    lands(game, "Island", 7);
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    const divination = toHand(game, "Divination");
    cast(game, divination, { settle: false });
    cast(game, toHand(game, "Katara's Reversal"), { targets: [ref(divination), null, null, null, ref(bears)] });
    expect(zone(game, divination)).toBe("graveyard");
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Clowning Around", () => {
  it("makes a third Clown Robot when the result is no more than your Robots", () => {
    const { game } = table();
    makeTokens(game, "Clown Robot Token", 4);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Clowning Around"));
    // Six Robots before the roll: any d6 result is six or less.
    expect(tokensNamed(game, "Clown Robot Token", A)).toBe(4 + 2 + 1);
  });
});

describe("The Duke, Rebel Sentry", () => {
  it("removes a counter to put a +1/+1 counter and hexproof on another creature", () => {
    const { game } = table();
    const duke = enter(game, "The Duke, Rebel Sentry");
    expect(counters(game, duke)).toBe(1);
    const bears = spawn(game, "Grizzly Bears");
    activate(game, duke, 0, { targets: [ref(bears)] });
    expect(counters(game, duke)).toBe(0);
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("hexproof")).toBe(true);
  });
});

describe("Pair o' Dice Lost", () => {
  it("returns chosen cards from the graveyard and exiles itself", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    const bears = toGraveyard(game, "Grizzly Bears");
    const wastes = toGraveyard(game, "Wastes");
    pickFromZone(a, bears, wastes);
    const pair = toHand(game, "Pair o' Dice Lost");
    cast(game, pair);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, wastes)).toBe("hand");
    expect(zone(game, pair)).toBe("exile");
  });

  it("can't return more total mana value than the dice show", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    const emrakul = toGraveyard(game, "Autochthon Wurm");
    const seen = pickFromZone(a, emrakul);
    cast(game, toHand(game, "Pair o' Dice Lost"));
    expect(seen.offered).not.toContain(emrakul);
    expect(zone(game, emrakul)).toBe("graveyard");
  });
});

describe("Mai and Zuko", () => {
  it("casts artifact spells at instant speed, but not other creature spells", () => {
    const { game } = table();
    spawn(game, "Mai and Zuko");
    lands(game, "Forest", 3);
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep" && s.priority.holder === A);
    const ring = toHand(game, "Sol Ring");
    cast(game, ring);
    expect(zone(game, ring)).toBe("battlefield");
    expect(() => cast(game, toHand(game, "Grizzly Bears"))).toThrow(/refused/);
  });
});

describe("Bohn, Beguiling Balladeer", () => {
  it("goads a creature an opponent controls on your second spell", () => {
    const { game, a } = table();
    spawn(game, "Bohn, Beguiling Balladeer");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 2);
    pickTargets(a, giant);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(game.state.objects[giant].goadedBy ?? []).not.toContain(A);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(game.state.objects[giant].goadedBy).toContain(A);
  });
});

describe("Ellie, Brick Master", () => {
  it("gives a player attacking your opponent a Cordyceps Infected attacking that opponent", () => {
    const { game, b } = table({ players: 3 });
    spawn(game, "Ellie, Brick Master");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareAttackersFn = () => [{ attacker: bears, defender: C }];
    toStep(game, "postcombat-main", B);
    expect(tokensNamed(game, "Cordyceps Infected Token", B)).toBe(1);
    expect(life(game, C)).toBe(20 - 2 - 1);
  });
});

describe("Goldbug, Humanity's Ally", () => {
  it("converts on your second spell each turn", () => {
    const { game } = table();
    const goldbug = spawn(game, "Goldbug, Humanity's Ally");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(subtypes(game, goldbug)).toContain("Robot");
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(subtypes(game, goldbug)).toContain("Vehicle");
  });

  it("Scrappy Scout: attacking with a Human draws a card and converts", () => {
    const { game, a } = table();
    const goldbug = spawn(game, "Goldbug, Humanity's Ally");
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(goldbug)]);
    settle(game);
    const human = spawn(game, "Elite Vanguard");
    const before = hand(game).length;
    attack(game, a, [goldbug, human]);
    expect(hand(game).length).toBe(before + 1);
    expect(subtypes(game, goldbug)).toContain("Robot");
  });
});

describe("Jetfire, Ingenious Scientist", () => {
  it("removes counters from artifacts for that much restricted {C}, then converts", () => {
    const { game } = table();
    const jetfire = spawn(game, "Jetfire, Ingenious Scientist");
    const thopter = spawn(game, "Ornithopter");
    addCounters(game, thopter, "+1/+1", 2);
    activate(game, jetfire, 0, { targets: [ref(A)], x: 2 });
    expect(counters(game, thopter)).toBe(0);
    expect(manaOf(game, "C")).toBe(2);
    expect(subtypes(game, jetfire)).toContain("Vehicle");
  });

  it("Air Guardian: {U}{U}{U} converts it back, then adapts 3", () => {
    const { game } = table();
    const jetfire = spawn(game, "Jetfire, Ingenious Scientist");
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(jetfire)]);
    settle(game);
    lands(game, "Island", 3);
    activate(game, jetfire, 0);
    expect(subtypes(game, jetfire)).toContain("Robot");
    expect(counters(game, jetfire)).toBe(3);
  });
});

describe("Bumi's Feast Lecture", () => {
  it("earthbends twice the Foods you control, the new one included", () => {
    const { game } = table();
    makeTokens(game, "Food Token", 1);
    lands(game, "Forest", 2);
    const land = spawn(game, "Forest");
    cast(game, toHand(game, "Bumi's Feast Lecture"), { targets: [ref(land)] });
    expect(counters(game, land)).toBe(4);
    expect(types(game, land)).toContain("creature");
  });
});

describe("Venom, Eddie Brock", () => {
  it("grows on any other death and draws only for a Villain", () => {
    const { game } = table();
    const venom = spawn(game, "Venom, Eddie Brock");
    const before = hand(game).length;
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(counters(game, venom)).toBe(1);
    expect(hand(game).length).toBe(before);
    destroy(game, spawn(game, "Venom, Deadly Devourer", B));
    expect(counters(game, venom)).toBe(2);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Mechanical Glider", () => {
  it("attaches to a creature as it enters, giving it flying", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Mechanical Glider");
    expect(keywords(game, bears).has("flying")).toBe(true);
  });
});

describe("Foot Chopper", () => {
  it("enters with a 1/1 black Ninja wearing it", () => {
    const { game } = table();
    enter(game, "Foot Chopper");
    const [ninja] = named(game, "Ninja Token (Dark Leo & Shredder)", A);
    expect(keywords(game, ninja).has("flying")).toBe(true);
  });

  it("may sacrifice the equipped creature that hit to draw cards equal to its power", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const giant = spawn(game, "Hill Giant");
    const chopper = spawn(game, "Foot Chopper");
    activate(game, chopper, 0, { targets: [ref(giant)] });
    const before = hand(game).length;
    pickModes(a, 0);
    attack(game, a, [giant]);
    expect(zone(game, giant)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 3);
  });
});

describe("April O'Neil, Human Element", () => {
  it("makes a Mutagen for an artifact, instant or sorcery spell, not a creature spell", () => {
    const { game } = table();
    spawn(game, "April O'Neil, Human Element");
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Sol Ring"));
    expect(tokensNamed(game, "Mutagen Token", A)).toBe(1);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(tokensNamed(game, "Mutagen Token", A)).toBe(1);
  });
});

describe("Match the Odds", () => {
  it("puts a counter on the Ally for each creature opponents control", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B);
    spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Match the Odds"));
    const [ally] = named(game, "Ally Token", A);
    expect(counters(game, ally)).toBe(2);
  });
});

describe("Tui and La, Moon and Ocean", () => {
  it("draws when tapped and grows when untapped", () => {
    const { game } = table();
    const tui = spawn(game, "Tui and La, Moon and Ocean");
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(tui)]);
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(tui)]);
    settle(game);
    expect(counters(game, tui)).toBe(1);
  });
});

describe("Bjorna, Nightfall Alchemist", () => {
  it("sacrifices an artifact to ping and goad a creature", () => {
    const { game } = table();
    const bjorna = spawn(game, "Bjorna, Nightfall Alchemist");
    const ring = spawn(game, "Sol Ring");
    const giant = spawn(game, "Hill Giant", B);
    activate(game, bjorna, 0, { targets: [ref(giant)], sacrifice: ring });
    expect(zone(game, ring)).toBe("graveyard");
    expect(game.state.objects[giant].damageMarked).toBe(1);
    expect(game.state.objects[giant].goadedBy).toContain(A);
  });
});

describe("Evin, Waterdeep Opportunist", () => {
  it("gets +2/+0 per Treasure and makes one tapped Treasure a turn for sacrifices", () => {
    const { game } = table();
    const evin = spawn(game, "Evin, Waterdeep Opportunist");
    lands(game, "Swamp", 2);
    const first = spawn(game, "Grizzly Bears");
    const second = spawn(game, "Grizzly Bears");
    const foes = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    cast(game, toHand(game, "Bone Splinters"), { targets: [ref(foes[0])], sacrifice: first });
    cast(game, toHand(game, "Bone Splinters"), { targets: [ref(foes[1])], sacrifice: second });
    expect(zone(game, first)).toBe("graveyard");
    expect(zone(game, second)).toBe("graveyard");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(pt(game, evin)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Owen Grady, Raptor Trainer", () => {
  it("puts the chosen keyword counter on a Dinosaur", () => {
    const { game, a } = table();
    const owen = spawn(game, "Owen Grady, Raptor Trainer");
    const raptor = spawn(game, "Ripjaw Raptor");
    pickModes(a, 2);
    activate(game, owen, 0, { targets: [ref(raptor)] });
    expect(counters(game, raptor, "trample")).toBe(1);
    expect(keywords(game, raptor).has("trample")).toBe(true);
  });
});

describe("Dragon's Desire", () => {
  it("adds {R} for each artifact opponents control", () => {
    const { game } = table();
    spawn(game, "Sol Ring", B);
    spawn(game, "Ornithopter", B);
    spawn(game, "Sol Ring");
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Dragon's Desire"));
    expect(manaOf(game, "R")).toBe(2);
  });
});

describe("Venom, Deadly Devourer", () => {
  it("puts counters equal to the exiled card's toughness on a Symbiote", () => {
    const { game, a } = table();
    lands(game, "Wastes", 3);
    const venom = spawn(game, "Venom, Deadly Devourer");
    const thopter = toGraveyard(game, "Ornithopter", B);
    pickTargets(a, venom);
    activate(game, venom, 0, { targets: [ref(thopter)] });
    expect(zone(game, thopter)).toBe("exile");
    expect(counters(game, venom)).toBe(2);
  });
});

describe("Rashel, Fist of Torm", () => {
  it("gives each Aura you control exalted", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const rashel = spawn(game, "Rashel, Fist of Torm");
    cast(game, toHand(game, "Holy Strength"), { targets: [ref(rashel)] });
    cast(game, toHand(game, "Holy Strength"), { targets: [ref(rashel)] });
    attack(game, a, [rashel]);
    // 2/4, +2/+4 from the Auras, +2/+2 from two exalted.
    expect(pt(game, rashel)).toEqual({ power: 6, toughness: 10 });
  });
});

describe("Princess Yue", () => {
  it("returns tapped as a legendary land named Moon that taps for {C}", () => {
    const { game } = table();
    const yue = spawn(game, "Princess Yue");
    destroy(game, yue);
    const [moon] = game.battlefield.filter((id) => game.state.objects[id].cardName === "Princess Yue");
    expect(moon).toBeDefined();
    expect(types(game, moon)).toEqual(["land"]);
    expect(subtypes(game, moon)).toEqual([]);
    expect(supertypes(game, moon)).toContain("legendary");
    expect(nameOf(game.state.objects[moon])).toBe("Moon");
    expect(game.state.objects[moon].tapped).toBe(true);
    destroy(game, moon);
    expect(game.battlefield.filter((id) => game.state.objects[id].cardName === "Princess Yue")).toHaveLength(0);
  });
});

describe("Jet, Rebel Leader", () => {
  it("puts a creature card with mana value 3 or less onto the battlefield tapped and attacking", () => {
    const { game, a } = table();
    const jet = spawn(game, "Jet, Rebel Leader");
    const bears = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, bears);
    attack(game, a, [jet]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, B)).toBe(20 - 3 - 2);
  });
});

describe("Themberchaud", () => {
  it("deals X to each other creature without flying and each player, X its controller's Mountains", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const angel = spawn(game, "Serra Angel", B);
    const them = enter(game, "Themberchaud");
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[angel].damageMarked).toBe(0);
    expect(game.state.objects[them].damageMarked).toBe(0);
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(18);
  });
});

describe("Dáin of the Ancient Halls", () => {
  it("deals damage equal to your Dwarves to each opponent", () => {
    const { game, a } = table();
    const dain = spawn(game, "Dáin of the Ancient Halls");
    spawn(game, "Dwarven Trader");
    attack(game, a, [dain]);
    expect(life(game, B)).toBe(20 - 2 - 4);
  });
});
