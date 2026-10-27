import { describe, expect, it } from "vitest";
import {
  A,
  B,
  C,
  activate,
  cast,
  destroy,
  enter,
  lands,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

// Darksteel (DST), batch 214: the lead's cards — the Echoing cycle and the
// earlier cards on the same clause, "and all other permanents with the same
// name as that permanent" (`CardFilter.sameNameAsTarget`, rule 201.2a).

describe("Echoing Truth", () => {
  it("returns the target and every permanent with its name, whoever controls it, and nothing else", () => {
    const { game } = table();
    const target = spawn(game, "Grizzly Bears", B);
    const twin = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears", A);
    const other = spawn(game, "Runeclaw Bear", B);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Echoing Truth"), { targets: [ref(target)] });
    expect([zone(game, target), zone(game, twin), zone(game, mine)]).toEqual(["hand", "hand", "hand"]);
    expect(zone(game, other)).toBe("battlefield");
  });
});

describe("Echoing Decay", () => {
  it("shrinks the target's namesakes, but a face-down creature has no name to share", () => {
    const { game } = table();
    const target = spawn(game, "Grizzly Bears", B);
    const twin = spawn(game, "Grizzly Bears", B);
    const hidden = spawn(game, "Grizzly Bears", B);
    game.state.objects[hidden].faceDown = { kind: "morph" };
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Echoing Decay"), { targets: [ref(target)] });
    expect(zone(game, target)).toBe("graveyard");
    expect(zone(game, twin)).toBe("graveyard");
    expect(zone(game, hidden)).toBe("battlefield");
  });

  it("on a face-down target, affects that one alone", () => {
    const { game } = table();
    const first = spawn(game, "Grizzly Bears", B);
    const second = spawn(game, "Grizzly Bears", B);
    game.state.objects[first].faceDown = { kind: "morph" };
    game.state.objects[second].faceDown = { kind: "morph" };
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Echoing Decay"), { targets: [ref(first)] });
    expect(zone(game, first)).toBe("graveyard");
    expect(zone(game, second)).toBe("battlefield");
  });
});

describe("Echoing Courage", () => {
  it("pumps the target and its namesakes only", () => {
    const { game } = table();
    const target = spawn(game, "Grizzly Bears");
    const twin = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Runeclaw Bear");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Echoing Courage"), { targets: [ref(target)] });
    expect(pt(game, target)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, twin)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, other)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Echoing Ruin and Echoing Calm", () => {
  it("destroy the target artifact and its namesakes", () => {
    const { game } = table();
    const target = spawn(game, "Ornithopter", B);
    const twin = spawn(game, "Ornithopter", B);
    const other = spawn(game, "Sol Ring", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Echoing Ruin"), { targets: [ref(target)] });
    expect([zone(game, target), zone(game, twin), zone(game, other)]).toEqual(["graveyard", "graveyard", "battlefield"]);
  });

  it("destroys the target enchantment and its namesakes", () => {
    const { game } = table();
    const target = spawn(game, "Pacifism", B);
    const twin = spawn(game, "Pacifism", A);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Echoing Calm"), { targets: [ref(target)] });
    expect([zone(game, target), zone(game, twin)]).toEqual(["graveyard", "graveyard"]);
  });
});

describe("Maelstrom Pulse", () => {
  it("destroys the target and every permanent with its name, tokens included", () => {
    const { game } = table();
    const target = spawn(game, "Grizzly Bears", B);
    const twin = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Runeclaw Bear", B);
    lands(game, "Swamp", 2);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Maelstrom Pulse"), { targets: [ref(target)] });
    expect([zone(game, target), zone(game, twin), zone(game, other)]).toEqual(["graveyard", "graveyard", "battlefield"]);
  });
});

describe("Wake of Destruction", () => {
  it("destroys lands by name, not by land type", () => {
    const { game } = table();
    const [target, twin] = lands(game, "Snow-Covered Forest", 2, B);
    const [forest] = lands(game, "Forest", 1, B);
    lands(game, "Mountain", 6);
    cast(game, toHand(game, "Wake of Destruction"), { targets: [ref(target)] });
    expect([zone(game, target), zone(game, twin), zone(game, forest)]).toEqual(["graveyard", "graveyard", "battlefield"]);
  });
});

describe("Bile Blight, Homing Lightning and Izzet Staticaster", () => {
  it("Bile Blight gives the namesakes -3/-3 too", () => {
    const { game } = table();
    const target = spawn(game, "Hill Giant", B);
    const twin = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Bile Blight"), { targets: [ref(target)] });
    expect([zone(game, target), zone(game, twin)]).toEqual(["graveyard", "graveyard"]);
  });

  it("Homing Lightning deals 4 to the target and each namesake", () => {
    const { game } = table();
    const target = spawn(game, "Hill Giant", B);
    const twin = spawn(game, "Hill Giant", A);
    const other = spawn(game, "Runeclaw Bear", B);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Homing Lightning"), { targets: [ref(target)] });
    expect([zone(game, target), zone(game, twin), zone(game, other)]).toEqual(["graveyard", "graveyard", "battlefield"]);
  });

  it("Izzet Staticaster pings every creature with the target's name", () => {
    const { game } = table();
    const caster = spawn(game, "Izzet Staticaster");
    const first = spawn(game, "Llanowar Elves", B);
    const second = spawn(game, "Llanowar Elves", B);
    const other = spawn(game, "Birds of Paradise", B);
    activate(game, caster, 0, { targets: [ref(first)] });
    expect([zone(game, first), zone(game, second), zone(game, other)]).toEqual(["graveyard", "graveyard", "battlefield"]);
  });
});

describe("Sever the Bloodline", () => {
  it("exiles the target's creature namesakes", () => {
    const { game } = table();
    const target = spawn(game, "Grizzly Bears", B);
    const twin = spawn(game, "Grizzly Bears", A);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Sever the Bloodline"), { targets: [ref(target)] });
    expect([zone(game, target), zone(game, twin)]).toEqual(["exile", "exile"]);
  });
});

describe("Declaration in Stone", () => {
  it("exiles the namesakes its controller controls, and they investigate once per nontoken one", () => {
    const { game } = table();
    const target = spawn(game, "Grizzly Bears", B);
    const twin = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears", A);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Declaration in Stone"), { targets: [ref(target)] });
    expect([zone(game, target), zone(game, twin), zone(game, mine)]).toEqual(["exile", "exile", "battlefield"]);
    expect(tokensNamed(game, "Clue Token", B)).toBe(2);
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
  });
});

describe("Deputy of Detention and Banishment", () => {
  it("Deputy exiles the opponent's namesakes until it leaves", () => {
    const { game, a } = table();
    const target = spawn(game, "Grizzly Bears", B);
    const twin = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears", A);
    pickTargets(a, target);
    const deputy = enter(game, "Deputy of Detention");
    expect([zone(game, target), zone(game, twin), zone(game, mine)]).toEqual(["exile", "exile", "battlefield"]);
    destroy(game, deputy);
    const bears = game.state.zones.shared.battlefield.filter(
      (id) => game.state.objects[id].cardName === "Grizzly Bears" && game.state.objects[id].controller === B,
    );
    expect(bears).toHaveLength(2);
  });

  it("Banishment takes the namesakes of every opponent, not your own", () => {
    const { game, a } = table({ players: 3 });
    const target = spawn(game, "Grizzly Bears", B);
    const third = spawn(game, "Grizzly Bears", C);
    const mine = spawn(game, "Grizzly Bears", A);
    pickTargets(a, target);
    enter(game, "Banishment");
    expect([zone(game, target), zone(game, third), zone(game, mine)]).toEqual(["exile", "exile", "battlefield"]);
  });
});

describe("Detention Sphere", () => {
  it("exiles the target and its namesakes and returns them when it leaves", () => {
    const { game, a } = table();
    const target = spawn(game, "Grizzly Bears", B);
    const twin = spawn(game, "Grizzly Bears", B);
    pickTargets(a, target);
    pickModes(a, 0);
    const sphere = enter(game, "Detention Sphere");
    expect([zone(game, target), zone(game, twin)]).toEqual(["exile", "exile"]);
    destroy(game, sphere);
    const bears = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Grizzly Bears");
    expect(bears).toHaveLength(2);
  });
});
