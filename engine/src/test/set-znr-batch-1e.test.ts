/**
 * Zendikar Rising and its Commander decks (ZNR, ZNC; B114), group e — plus
 * two Final Fantasy party cards. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  named,
  nextTurn,
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
  toStep,
  tokensNamed,
  zone,
  destroy,
} from "./harness.js";

describe("Grakmaw, Skyclave Ravager", () => {
  it("grows when a creature with a +1/+1 counter dies, and leaves a Hydra that size", () => {
    const { game } = table();
    const grakmaw = enter(game, "Grakmaw, Skyclave Ravager");
    expect(counters(game, grakmaw)).toBe(3);
    const bears = spawn(game, "Grizzly Bears");
    const plain = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    settle(game);
    destroy(game, plain);
    expect(counters(game, grakmaw)).toBe(3);
    destroy(game, bears);
    expect(counters(game, grakmaw)).toBe(4);
    destroy(game, grakmaw);
    const [hydra] = named(game, "Hydra Token (Black-Green)", A);
    expect(hydra).toBeDefined();
    expect(pt(game, hydra)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Myriad Construct", () => {
  it("is sacrificed when a spell targets it, leaving Constructs equal to its power", () => {
    const { game } = table();
    const construct = spawn(game, "Myriad Construct");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(construct)] });
    expect(zone(game, construct)).toBe("graveyard");
    expect(tokensNamed(game, "Construct Token (Jan Jansen, Chaos Crafter)", A)).toBe(4);
  });

  it("kicked, enters with a counter for each nonbasic land opponents control", () => {
    const { game } = table();
    spawn(game, "Ghost Quarter", B);
    spawn(game, "Ghost Quarter", B);
    spawn(game, "Ghost Quarter", A);
    spawn(game, "Wastes", B);
    lands(game, "Wastes", 7);
    const card = toHand(game, "Myriad Construct");
    cast(game, card, { kicked: true });
    expect(counters(game, card)).toBe(2);
  });
});

describe("Moss-Pit Skeleton", () => {
  it("from the graveyard, may go on top of the library when counters go on your creature", () => {
    const { game, a } = table();
    const skeleton = toGraveyard(game, "Moss-Pit Skeleton");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    settle(game);
    expect(zone(game, skeleton)).toBe("library");
    expect(game.state.zones.perPlayer[A].library[0]).toBe(skeleton);
  });
});

describe("Expedition Diviner", () => {
  it("draws on death only with another Wizard — even one dying beside it", () => {
    const lone = table();
    const alone = spawn(lone.game, "Expedition Diviner");
    const before = hand(lone.game).length;
    destroy(lone.game, alone);
    expect(hand(lone.game).length).toBe(before);

    const { game } = table();
    spawn(game, "Expedition Diviner");
    spawn(game, "Cascade Seer");
    const start = hand(game).length;
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { type: "creature" } }, []);
    settle(game);
    expect(hand(game).length).toBe(start + 1);
  });
});

describe("Paired Tactician", () => {
  it("gets a counter only when another Warrior attacks beside it", () => {
    const lone = table();
    const solo = spawn(lone.game, "Paired Tactician");
    spawn(lone.game, "Grizzly Bears");
    attack(lone.game, lone.a, [solo]);
    expect(counters(lone.game, solo)).toBe(0);

    const { game, a } = table();
    const tactician = spawn(game, "Paired Tactician");
    const blademaster = spawn(game, "Kor Blademaster");
    attack(game, a, [tactician, blademaster]);
    expect(counters(game, tactician)).toBe(1);
  });
});

describe("Relic Axe and Kor Blademaster", () => {
  it("gives a Warrior +2/+1 and a non-Warrior +1/+1; an equipped Warrior has double strike", () => {
    const { game, a } = table();
    spawn(game, "Kor Blademaster");
    const tactician = spawn(game, "Paired Tactician");
    pickTargets(a, tactician);
    const axe = enter(game, "Relic Axe");
    expect(pt(game, tactician)).toEqual({ power: 5, toughness: 3 });
    expect(keywords(game, tactician).has("double-strike")).toBe(true);

    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "attach", target: 0, attachment: "source" }, [ref(bears)], { source: axe });
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, tactician)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, tactician).has("double-strike")).toBe(false);
  });
});

describe("Swarm Shambler", () => {
  it("makes an Insect when an opponent's spell targets your creature with a +1/+1 counter", () => {
    const { game } = table();
    const shambler = enter(game, "Swarm Shambler");
    expect(counters(game, shambler)).toBe(1);
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(shambler)] });
    expect(tokensNamed(game, "Insect Token", A)).toBe(1);
  });
});

describe("Umara Mystic", () => {
  it("is pumped by a Wizard creature spell, not by another creature spell", () => {
    const { game } = table();
    const mystic = spawn(game, "Umara Mystic");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(pt(game, mystic)).toEqual({ power: 1, toughness: 3 });
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Ardent Electromancer"));
    expect(pt(game, mystic)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Bloodchief's Thirst", () => {
  it("unkicked hits only mana value 2 or less; kicked, any creature", () => {
    const { game } = table();
    const seer = spawn(game, "Cascade Seer", B);
    lands(game, "Swamp", 4);
    const thirst = toHand(game, "Bloodchief's Thirst");
    expect(() => cast(game, thirst, { targets: [ref(seer)] })).toThrow();
    cast(game, thirst, { targets: [ref(seer)], kicked: true });
    expect(zone(game, seer)).toBe("graveyard");
  });
});

describe("Pelakka Predation", () => {
  it("lets you choose only a card with mana value 3 or greater", () => {
    const { game, a } = table();
    const bears = toHand(game, "Grizzly Bears", B);
    const seer = toHand(game, "Cascade Seer", B);
    lands(game, "Swamp", 3);
    const seen = pickFromZone(a, seer);
    cast(game, toHand(game, "Pelakka Predation"), { targets: [ref(B)] });
    expect(seen.offered).toEqual([seer]);
    expect(zone(game, seer)).toBe("graveyard");
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("The Destined Thief", () => {
  it("draws three with a full party after combat damage", () => {
    const { game, a } = table();
    const thief = spawn(game, "The Destined Thief");
    spawn(game, "Springmantle Cleric");
    spawn(game, "Paired Tactician");
    spawn(game, "Cascade Seer");
    const before = hand(game).length;
    attack(game, a, [thief]);
    expect(hand(game).length).toBe(before + 3);
    expect(graveyard(game).length).toBe(0);
  });
});

describe("The Destined Black Mage", () => {
  it("deals 1 to each opponent for a noncreature spell, 3 with a full party", () => {
    const { game } = table();
    spawn(game, "The Destined Black Mage");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(game.state.players[B].life).toBe(17);
    spawn(game, "Springmantle Cleric");
    spawn(game, "Paired Tactician");
    spawn(game, "The Destined Thief");
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(game.state.players[B].life).toBe(12);
  });
});

describe("Shatterskull Charger", () => {
  it("returns to hand at your end step without a +1/+1 counter", () => {
    const { game } = table();
    const charger = spawn(game, "Shatterskull Charger");
    toStep(game, "end");
    settle(game);
    expect(zone(game, charger)).toBe("hand");
  });
});

describe("Magmatic Channeler", () => {
  it("gets +3/+1 with four instant and sorcery cards in your graveyard", () => {
    const { game } = table();
    const channeler = spawn(game, "Magmatic Channeler");
    for (let i = 0; i < 3; i += 1) toGraveyard(game, "Shock");
    expect(pt(game, channeler)).toEqual({ power: 1, toughness: 3 });
    toGraveyard(game, "Cleansing Wildfire");
    expect(pt(game, channeler)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Cleansing Wildfire", () => {
  it("destroys the land, lets its controller fetch a basic tapped, and draws", () => {
    const { game, b } = table();
    const wastes = spawn(game, "Wastes", B);
    lands(game, "Mountain", 2);
    pickModes(b, 0);
    b.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    const before = hand(game).length;
    cast(game, toHand(game, "Cleansing Wildfire"), { targets: [ref(wastes)] });
    expect(zone(game, wastes)).toBe("graveyard");
    const bobLands = game.battlefield.filter((id) => game.state.objects[id].controller === B);
    expect(bobLands.length).toBe(1);
    expect(game.state.objects[bobLands[0]].tapped).toBe(true);
    expect(hand(game).length).toBe(before + 1);
  });
});
